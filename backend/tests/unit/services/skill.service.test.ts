const mockSkillRepository = {
  createSkill: jest.fn(),
  proposeSkill: jest.fn(),
  getAllSkills: jest.fn(),
  getActiveSkills: jest.fn(),
  searchSkills: jest.fn(),
  getSkillById: jest.fn(),
  getSkillByName: jest.fn(),
  updateSkill: jest.fn(),
  deleteSkill: jest.fn(),
  getPendingCount: jest.fn(),
};

jest.mock("../../../src/repositories/skill.repository", () => ({
  SkillMongoRepository: jest.fn(() => mockSkillRepository),
}));
jest.mock("../../../src/services/notification.service", () => ({
  notificationService: { createNotification: jest.fn() },
}));
jest.mock("../../../src/models/user.model", () => ({
  UserModel: { find: jest.fn() },
}));

import { SkillService } from "../../../src/services/skill.service";
import { UserModel } from "../../../src/models/user.model";

describe("SkillService (unit)", () => {
  const service = new SkillService();
  const newSkill = { name: "Python", isActive: true, isApproved: true };

  beforeEach(() => jest.clearAllMocks());

  it("creates a skill with an available name", async () => {
    mockSkillRepository.getSkillByName.mockResolvedValue(null);
    mockSkillRepository.createSkill.mockResolvedValue(newSkill);
    await expect(service.createSkill(newSkill)).resolves.toEqual(newSkill);
  });

  it("rejects a duplicate skill", async () => {
    mockSkillRepository.getSkillByName.mockResolvedValue({ _id: "skill-1" });
    await expect(service.createSkill(newSkill)).rejects.toMatchObject({
      status: 400,
    });
  });

  it("trims a proposed skill name", async () => {
    mockSkillRepository.getSkillByName.mockResolvedValue(null);
    mockSkillRepository.proposeSkill.mockResolvedValue({ name: "Origami" });
    await service.proposeSkill("  Origami  ", "user-1");
    expect(mockSkillRepository.proposeSkill).toHaveBeenCalledWith(
      "Origami",
      "user-1",
    );
  });

  it("does not search for a blank query", async () => {
    await expect(service.searchSkills(" ")).resolves.toEqual([]);
    expect(mockSkillRepository.searchSkills).not.toHaveBeenCalled();
  });

  it("uses active skills unless inactive skills are requested", async () => {
    mockSkillRepository.getActiveSkills.mockResolvedValue([newSkill]);
    await expect(service.getAllSkills()).resolves.toEqual([newSkill]);
    expect(mockSkillRepository.getAllSkills).not.toHaveBeenCalled();
  });

  it("returns a requested skill", async () => {
    mockSkillRepository.getSkillById.mockResolvedValue(newSkill);
    await expect(service.getSkillById("skill-1")).resolves.toEqual(newSkill);
  });

  it("reports a missing skill", async () => {
    mockSkillRepository.getSkillById.mockResolvedValue(null);
    await expect(service.getSkillById("missing")).rejects.toMatchObject({
      status: 404,
    });
  });

  it("covers proposals, updates, deletion, and notification branches", async () => {
    const saved = jest.fn();
    const proposed = { _id: "s1", proposedBy: ["user-1"], save: saved };
    mockSkillRepository.getSkillByName.mockResolvedValueOnce(proposed);
    await service.proposeSkill("Origami", "user-1");
    mockSkillRepository.getSkillByName.mockResolvedValueOnce({ _id: "s1", proposedBy: [], save: saved });
    await service.proposeSkill("Origami", "user-2"); expect(saved).toHaveBeenCalled();
    mockSkillRepository.getAllSkills.mockResolvedValueOnce([newSkill]); await service.getAllSkills(true);
    mockSkillRepository.searchSkills.mockResolvedValueOnce([newSkill]); await service.searchSkills(" Python ");

    mockSkillRepository.getSkillByName.mockResolvedValueOnce({ _id: "other" });
    await expect(service.updateSkill("s1", { name: "Python" } as any)).rejects.toMatchObject({ status: 400 });
    mockSkillRepository.getSkillByName.mockResolvedValueOnce(null); mockSkillRepository.getSkillById.mockResolvedValueOnce(null);
    await expect(service.updateSkill("missing", {} as any)).rejects.toMatchObject({ status: 404 });
    mockSkillRepository.getSkillById.mockResolvedValueOnce({ isApproved: false }); mockSkillRepository.updateSkill.mockResolvedValueOnce(null);
    await expect(service.updateSkill("s1", {} as any)).rejects.toMatchObject({ status: 404 });
    mockSkillRepository.getSkillById.mockResolvedValueOnce({ isApproved: false }); mockSkillRepository.updateSkill.mockResolvedValueOnce({ isApproved: true, proposedBy: ["u1"], name: "Python" });
    await service.updateSkill("s1", {} as any);

    mockSkillRepository.getSkillById.mockResolvedValueOnce(null); await expect(service.deleteSkill("missing")).rejects.toMatchObject({ status: 404 });
    const user = { _id: "u2", skillsOffered: ["Python"], skillsWanted: ["Python"], save: jest.fn() };
    mockSkillRepository.getSkillById.mockResolvedValueOnce({ name: "Python", proposedBy: ["u1"] });
    (UserModel.find as jest.Mock).mockResolvedValueOnce([user]); mockSkillRepository.deleteSkill.mockResolvedValueOnce({ _id: "s1" });
    await service.deleteSkill("s1"); expect(user.save).toHaveBeenCalled();
  });
});
