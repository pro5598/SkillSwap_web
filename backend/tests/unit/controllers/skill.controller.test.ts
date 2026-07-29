import { Request, Response } from "express";

const mockSkillService = {
  createSkill: jest.fn(),
  proposeSkill: jest.fn(),
  getAllSkills: jest.fn(),
  getSkillById: jest.fn(),
  updateSkill: jest.fn(),
  deleteSkill: jest.fn(),
  searchSkills: jest.fn(),
  getPendingCount: jest.fn(),
};

jest.mock("../../../src/services/skill.service", () => ({
  SkillService: jest.fn(() => mockSkillService),
}));

import { SkillController } from "../../../src/controllers/skill.controller";

function createResponse() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  return { status, json } as unknown as Response;
}

describe("SkillController (unit)", () => {
  const controller = new SkillController();

  beforeEach(() => jest.clearAllMocks());

  it("validates, creates, and returns a skill", async () => {
    mockSkillService.createSkill.mockResolvedValue({ _id: "skill-1", name: "Python" });
    const res = createResponse();

    await controller.createSkill({ body: { name: "Python" } } as Request, res);

    expect(mockSkillService.createSkill).toHaveBeenCalledWith(expect.objectContaining({ name: "Python" }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("handles validation, proposal, lookup, update, deletion, search, and pending-count paths", async () => {
    await controller.createSkill({ body: {} } as Request, createResponse());
    mockSkillService.createSkill.mockRejectedValueOnce({ message: "duplicate", status: 409 });
    await controller.createSkill({ body: { name: "Python" } } as Request, createResponse());

    await controller.proposeSkill({ body: { name: "x" } } as Request, createResponse());
    await controller.proposeSkill({ body: { name: "React" } } as Request, createResponse());
    mockSkillService.proposeSkill.mockResolvedValue({ name: "React" });
    await controller.proposeSkill({ body: { name: " React " }, user: { id: "u1" } } as any, createResponse());

    mockSkillService.getAllSkills.mockResolvedValue([]);
    await controller.getAllSkills({ query: {} } as any, createResponse());
    await controller.getAllSkills({ query: { all: "true" } } as any, createResponse());
    mockSkillService.getSkillById.mockResolvedValue({ _id: "s1" });
    await controller.getSkillById({ params: { id: "s1" } } as any, createResponse());

    await controller.updateSkill({ params: { id: "s1" }, body: {} } as any, createResponse());
    mockSkillService.updateSkill.mockResolvedValue({ _id: "s1" });
    await controller.updateSkill({ params: { id: "s1" }, body: { name: "Node" } } as any, createResponse());
    mockSkillService.deleteSkill.mockResolvedValue(undefined);
    await controller.deleteSkill({ params: { id: "s1" } } as any, createResponse());
    mockSkillService.searchSkills.mockResolvedValue([]);
    await controller.searchSkills({ query: {} } as any, createResponse());
    await controller.searchSkills({ query: { q: "node" } } as any, createResponse());
    mockSkillService.getPendingCount.mockResolvedValue(2);
    await controller.getPendingCount({} as any, createResponse());
  });
});
