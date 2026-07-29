import axiosInstance from "./axios";

export const getAllSkills = async (includeInactive: boolean = false) => {
  return await axiosInstance.get(`/skills?all=${includeInactive}`);
};

export const getSkillById = async (id: string) => {
  return await axiosInstance.get(`/skills/${id}`);
};

export const searchSkills = async (query: string) => {
  return await axiosInstance.get(`/skills/search?q=${encodeURIComponent(query)}`);
};

export const proposeSkill = async (name: string) => {
  return await axiosInstance.post("/skills/propose", { name });
};
