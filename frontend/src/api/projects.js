import api from "./axios";

export const fetchProjects = async () => {
  const response = await api.get("/api/projects/");
  return response.data;
};

export const fetchMyProjects = async () => {
  const response = await api.get("/api/projects/my-projects/");
  return response.data;
};

export const fetchProjectManagers = async () => {
  const response = await api.get("/api/accounts/create/");
  return Array.isArray(response.data) ? response.data : [];
};

export const createProject = async (payload) => {
  const response = await api.post("/api/projects/create/", payload);
  return response.data;
};

