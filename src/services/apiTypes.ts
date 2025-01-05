export interface BaseFileData {
  id: string;
  name: string;
  content: string;
}

export const API_URL = `http://${
  import.meta.env.VITE_SERVER_IP_ADDRESS
}:5000/api`;
