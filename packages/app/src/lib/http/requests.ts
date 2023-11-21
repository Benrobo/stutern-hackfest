import $axios from "./axios";

export const extractLinks = async (data: any) => {
  const req = await $axios.post("/user/get_all_links", data);
  return req.data;
};

export const createChat = async (payload: any) => {
  const req = await $axios.post("/chat", payload);
  return req.data;
};

export const getSecrets = async () => {
  const req = await $axios.get("/secret");
  return req.data;
};

export const deleteSecret = async (id: string) => {
  const req = await $axios.delete(`/secret/${id}`);
  return req.data;
};

export const updateSecret = async (payload: any) => {
  const req = await $axios.put(`/secret`, payload);
  return req.data;
};

export const createProject = async (payload: any) => {
  const req = await $axios.post(`/project`, payload);
  return req.data;
};

export const getProjects = async () => {
  const req = await $axios.get(`/project`);
  return req.data;
};

export const getUserSettings = async () => {
  const req = await $axios.get(`/user/settings`);
  return req.data;
};
