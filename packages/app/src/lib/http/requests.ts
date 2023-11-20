import $axios from "./axios";

export const getUser = async () => {
  const req = await $axios.get("/api/user");
  return req.data;
};

export const createSecret = async (payload: any) => {
  const req = await $axios.post("/api/secret", payload);
  return req.data;
};

export const getSecrets = async () => {
  const req = await $axios.get("/api/secret");
  return req.data;
};

export const deleteSecret = async (id: string) => {
  const req = await $axios.delete(`/api/secret/${id}`);
  return req.data;
};

export const updateSecret = async (payload: any) => {
  const req = await $axios.put(`/api/secret`, payload);
  return req.data;
};

export const createProject = async (payload: any) => {
  const req = await $axios.post(`/api/project`, payload);
  return req.data;
};

export const getProjects = async () => {
  const req = await $axios.get(`/api/project`);
  return req.data;
};

export const getUserSettings = async () => {
  const req = await $axios.get(`/api/user/settings`);
  return req.data;
};
