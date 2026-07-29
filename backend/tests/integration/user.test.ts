import request from 'supertest';
import app from '../../src/app';
import { UserModel } from '../../src/models/user.model';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../src/configs/constant';

// Helper to create a user and get token
async function createUserAndGetToken(overrides: any = {}) {
  const defaultUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    username: 'johndoe',
    password: await bcryptjs.hash('password123', 10),
    role: 'user',
    ...overrides,
  };
  const user = await UserModel.create(defaultUser);
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  return { user, token };
}

async function createAdminAndGetToken() {
  return createUserAndGetToken({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    username: 'adminuser',
    role: 'admin',
  });
}

describe('User API - GET /api/v1/user/me', () => {
  it('should return current user when authenticated', async () => {
    const { token } = await createUserAndGetToken();
    const res = await request(app)
      .get('/api/v1/user/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('john@example.com');
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/v1/user/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/user/me')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
  });
});

describe('User API - PUT /api/v1/user/update', () => {
  it('should update user firstName', async () => {
    const { token } = await createUserAndGetToken();
    const res = await request(app)
      .put('/api/v1/user/update')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.firstName).toBe('Updated');
  });

  it('should update user bio', async () => {
    const { token } = await createUserAndGetToken();
    const res = await request(app)
      .put('/api/v1/user/update')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'I love coding and teaching' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.bio).toBe('I love coding and teaching');
  });

  it('should update skillsOffered', async () => {
    const { token } = await createUserAndGetToken();
    const res = await request(app)
      .put('/api/v1/user/update')
      .set('Authorization', `Bearer ${token}`)
      .send({ skillsOffered: JSON.stringify(['Python', 'JavaScript']) })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
  });

  it('should reject update without authentication', async () => {
    const res = await request(app)
      .put('/api/v1/user/update')
      .send({ firstName: 'Hacker' });
    expect(res.status).toBe(401);
  });

  it('should reject duplicate email update', async () => {
    await createUserAndGetToken({
      email: 'existing@example.com',
      username: 'existing',
    });
    const { token } = await createUserAndGetToken({
      email: 'john2@example.com',
      username: 'john2',
    });
    const res = await request(app)
      .put('/api/v1/user/update')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'existing@example.com' });
    expect(res.status).toBe(400);
  });
});

describe('User API - GET /api/v1/user/ (discover)', () => {
  it('should return discover users (non-admin)', async () => {
    const { token } = await createUserAndGetToken();
    await createUserAndGetToken({
      email: 'other@example.com',
      username: 'otheruser',
    });
    const res = await request(app)
      .get('/api/v1/user/')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.users).toBeDefined();
  });

  it('should require authentication', async () => {
    const res = await request(app).get('/api/v1/user/');
    expect(res.status).toBe(401);
  });
});

describe('Admin User API', () => {
  it('GET /admin/stats should return stats for admin', async () => {
    const { token } = await createAdminAndGetToken();
    const res = await request(app)
      .get('/api/v1/user/admin/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalUsers).toBeDefined();
  });

  it('GET /admin/stats should reject non-admin', async () => {
    const { token } = await createUserAndGetToken();
    const res = await request(app)
      .get('/api/v1/user/admin/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('GET /admin/all should return all users for admin', async () => {
    const { token } = await createAdminAndGetToken();
    await createUserAndGetToken({
      email: 'u2@example.com',
      username: 'u2user',
    });
    const res = await request(app)
      .get('/api/v1/user/admin/all')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.users)).toBe(true);
  });

  it('GET /admin/:id should get user by ID', async () => {
    const { token } = await createAdminAndGetToken();
    const { user: targetUser } = await createUserAndGetToken({
      email: 'target@example.com',
      username: 'targetuser',
    });
    const res = await request(app)
      .get(`/api/v1/user/admin/${targetUser._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('target@example.com');
  });

  it('DELETE /admin/:id should delete a user', async () => {
    const { token } = await createAdminAndGetToken();
    const { user: targetUser } = await createUserAndGetToken({
      email: 'delete@example.com',
      username: 'deleteuser',
    });
    const res = await request(app)
      .delete(`/api/v1/user/admin/${targetUser._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const deleted = await UserModel.findById(targetUser._id);
    expect(deleted).toBeNull();
  });

  it('DELETE /admin/:id should reject non-admin', async () => {
    const { token } = await createUserAndGetToken();
    const { user: targetUser } = await createUserAndGetToken({
      email: 'targetd@example.com',
      username: 'targetduser',
    });
    const res = await request(app)
      .delete(`/api/v1/user/admin/${targetUser._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
