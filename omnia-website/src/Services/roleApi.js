import axios from "./axios";

export const createRole = (data) => {
  return axios.post("/roles/", data);
};

export const getRoles = () => {
  return axios.get("/roles/");
};

export const getRoleById = (id) => {
  return axios.get(`/roles/${id}`);
};
export const updateRole = (id, data) => {
  return axios.put(`/roles/${id}`, data);
};

export const deleteRole = (id) => {
  return axios.delete(`/roles/${id}`);
};
