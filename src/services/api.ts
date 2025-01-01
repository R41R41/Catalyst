import { FileData } from "../types/File";

const API_URL = `http://${process.env.REACT_APP_SERVER_IP_ADDRESS}:5000/api`;

export const fetchScenarios = async () => {
  try {
    const response = await fetch(`${API_URL}/scenarios`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching scenarios:", error);
    throw error;
  }
};

export const updateScenario = async (fileId: string, content: string) => {
  await fetch(`${API_URL}/scenarios/${fileId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
};

export const createScenario = async (file: FileData) => {
  const response = await fetch(`${API_URL}/scenarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(file),
  });
  return response.json();
};

export const deleteScenario = async (fileId: string) => {
  await fetch(`${API_URL}/scenarios/${fileId}`, {
    method: "DELETE",
  });
};

export const renameScenario = async (fileId: string, newName: string) => {
  const response = await fetch(`${API_URL}/scenarios/${fileId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: newName }),
  });
  return response.json();
};
