import request from "supertest";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import app from "../../src/app";
import { UserModel } from "../../src/models/user.model";
import { SkillModel } from "../../src/models/skill.model";
import { JWT_SECRET } from "../../src/configs/constant";

async function createAdminToken() {
  const user = await UserModel.create({
    firstName: "Admin", lastName: "User", email: "admin@skill.test", username: "skilladmin",
    password: await bcryptjs.hash("password123", 10), role: "admin",
  });
  return jwt.sign({ id: user._id, email: user.email, role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
}

async function createUserToken() {
  const user = await UserModel.create({
    firstName: "Regular", lastName: "User", email: "user@skill.test", username: "skilluser",
    password: await bcryptjs.hash("password123", 10), role: "user",
  });
  return jwt.sign({ id: user._id, email: user.email, role: "user" }, JWT_SECRET, { expiresIn: "7d" });
}

describe("Skill API", () => {
  it("returns an empty array when no skills exist", async () => {
    const response = await request(app).get("/api/v1/skills");
    expect(response.status).toBe(200);
    expect(response.body.data.skills).toEqual([]);
  });

  it("returns active skills", async () => {
    await SkillModel.create([
      { name: "JavaScript", isActive: true, isApproved: true },
      { name: "Hidden Skill", isActive: false, isApproved: true },
      { name: "Pending Skill", isActive: true, isApproved: false },
    ]);
    const response = await request(app).get("/api/v1/skills");
    expect(response.status).toBe(200);
    expect(response.body.data.skills.map((skill: { name: string }) => skill.name)).toEqual(["JavaScript", "Pending Skill"]);
  });

  it("allows an admin to create a skill", async () => {
    const token = await createAdminToken();
    const response = await request(app).post("/api/v1/skills").set("Authorization", `Bearer ${token}`).send({ name: "Python", description: "Python programming" });
    expect(response.status).toBe(201);
    expect(response.body.data.skill.name).toBe("Python");
  });

  it("rejects duplicate skill names", async () => {
    const token = await createAdminToken();
    await SkillModel.create({ name: "Python" });
    const response = await request(app).post("/api/v1/skills").set("Authorization", `Bearer ${token}`).send({ name: "Python" });
    expect(response.status).toBe(400);
  });

  it("prevents non-admins from creating a skill", async () => {
    const token = await createUserToken();
    const response = await request(app).post("/api/v1/skills").set("Authorization", `Bearer ${token}`).send({ name: "Hacking" });
    expect(response.status).toBe(403);
  });

  it("allows users to propose a skill", async () => {
    const token = await createUserToken();
    const response = await request(app).post("/api/v1/skills/propose").set("Authorization", `Bearer ${token}`).send({ name: "Origami" });
    expect(response.status).toBe(201);
    expect(response.body.data.skill.name).toBe("Origami");
  });

  it("rejects an invalid proposed skill", async () => {
    const token = await createUserToken();
    const response = await request(app).post("/api/v1/skills/propose").set("Authorization", `Bearer ${token}`).send({ name: "" });
    expect(response.status).toBe(400);
  });

  it("searches skills by name", async () => {
    await SkillModel.create([{ name: "JavaScript", isActive: true, isApproved: true }, { name: "Java", isActive: true, isApproved: true }, { name: "Python", isActive: true, isApproved: true }]);
    const response = await request(app).get("/api/v1/skills/search?q=Java");
    expect(response.status).toBe(200);
    expect(response.body.data.skills).toHaveLength(2);
  });

  it("returns no results for an unmatched search", async () => {
    const response = await request(app).get("/api/v1/skills/search?q=zzzzxxx");
    expect(response.status).toBe(200);
    expect(response.body.data.skills).toEqual([]);
  });

  it("allows an admin to update a skill", async () => {
    const token = await createAdminToken();
    const skill = await SkillModel.create({ name: "OldSkill" });
    const response = await request(app).put(`/api/v1/skills/${skill._id}`).set("Authorization", `Bearer ${token}`).send({ name: "UpdatedSkill", isApproved: true });
    expect(response.status).toBe(200);
    expect(response.body.data.skill.name).toBe("UpdatedSkill");
  });

  it("allows an admin to delete a skill", async () => {
    const token = await createAdminToken();
    const skill = await SkillModel.create({ name: "ToDelete" });
    const response = await request(app).delete(`/api/v1/skills/${skill._id}`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
