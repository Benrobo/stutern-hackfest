import axios from "axios";

// api url
const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://api.velozweb.dev";

// custom axios instance with necessary details
const $axios = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default $axios;
