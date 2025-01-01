import { FileData } from "../types/File";

const API_URL = `http://${process.env.REACT_APP_SERVER_IP_ADDRESS}:5000/api`;

export const fetchFiles = async () => {
  try {
    console.log("Fetching from:", `${API_URL}/files`);
    const response = await fetch(`${API_URL}/files`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error;
  }
};

export const updateFile = async (fileId: string, content: string) => {
  await fetch(`${API_URL}/files/${fileId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
};

export const createFile = async (file: FileData) => {
  const response = await fetch(`${API_URL}/files`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(file),
  });
  return response.json();
};
