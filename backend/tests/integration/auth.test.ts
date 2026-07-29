import request from 'supertest';
import app from '../../src/app';
import { UserModel } from '../../src/models/user.model';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../src/configs/constant';

describe('Auth API - POST /api/v1/auth/register', () => {
  const validUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@example.com',
    username: 'testuser123',
    phoneNumber: '1234567890',
    password: 'password123',
  };

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('testuser@example.com');
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('should reject registration with missing firstName', async () => {
    const { firstName, ...userData } = validUser;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(userData);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validUser, email: 'invalid-email' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with short password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validUser, password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject duplicate email registration', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validUser, username: 'another_user' });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('email already exists');
  });

  it('should reject duplicate username registration', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validUser, email: 'other@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('username is already taken');
  });

  it('should reject registration with invalid username (special chars)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validUser, username: 'bad user!!' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should set an httpOnly cookie on registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validUser);
    expect(res.headers['set-cookie']).toBeDefined();
    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toContain('skillswap_auth_token');
    expect(cookie).toContain('HttpOnly');
  });

  it('should hash the password before storing', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);
    const user = await UserModel.findOne({ email: validUser.email });
    expect(user?.password).not.toBe(validUser.password);
    const isHashed = await bcryptjs.compare(validUser.password, user!.password!);
    expect(isHashed).toBe(true);
  });
});

describe('Auth API - POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    const hashedPassword = await bcryptjs.hash('password123', 10);
    await UserModel.create({
      firstName: 'Login',
      lastName: 'User',
      email: 'login@example.com',
      username: 'loginuser',
      password: hashedPassword,
    });
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('login@example.com');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'wrongpass123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject login with non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject login with missing email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject login with missing password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return a valid JWT token on login', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'password123' });
    const decoded = jwt.verify(res.body.data.token, JWT_SECRET) as any;
    expect(decoded.email).toBe('login@example.com');
    expect(decoded.id).toBeDefined();
  });
});

describe('Auth API - POST /api/v1/auth/logout', () => {
  it('should clear the auth cookie on logout', async () => {
    const res = await request(app).post('/api/v1/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const cookie = res.headers['set-cookie']?.[0];
    expect(cookie).toContain('skillswap_auth_token');
  });
});

describe('Auth API - POST /api/v1/auth/forgot-password', () => {
  it('should return success even for non-existent email (security)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject with invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('Auth API - POST /api/v1/auth/reset-password', () => {
  it('should reject reset with invalid token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'invalidtoken', newPassword: 'newpassword123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject reset with missing token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ newPassword: 'newpassword123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject reset with short new password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'sometoken', newPassword: '123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
