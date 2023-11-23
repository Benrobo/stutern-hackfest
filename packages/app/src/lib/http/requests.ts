import $axios from "./axios";

export const extractLinks = async (data: any) => {
  const req = await $axios.post("/user/get_all_links", data);
  return req.data;
};

export const createChat = async (payload: any) => {
  const req = await $axios.post("/chat", payload);
  return req.data;
};

export const getAllChats = async () => {
  const req = await $axios.get("/chat");
  return req.data;
};

export const deleteChatbot = async (id: string) => {
  const req = await $axios.delete(`/chat/${id}`);
  return req.data;
};

export const getConversations = async (query: string) => {
  const req = await $axios.get(`/chat/conversations?query=${query}`);
  return req.data;
};

export const getConversationMessages = async (conv_id: string) => {
  const req = await $axios.get(`/chat/conversations/messages/${conv_id}`);
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
