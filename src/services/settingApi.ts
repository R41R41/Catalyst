import { API_URL, BaseFileData } from "./apiTypes";

export const fetchSettings = async (): Promise<BaseFileData[]> => {
  const response = await fetch(`${API_URL}/settings`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

export const createSetting = async (
  file: BaseFileData
): Promise<BaseFileData> => {
  const response = await fetch(`${API_URL}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(file),
  });
  return await response.json();
};

export const updateSetting = async (fileId: string, content: string) => {
  await fetch(`${API_URL}/settings/${fileId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
};

export const deleteSetting = async (fileId: string) => {
  await fetch(`${API_URL}/settings/${fileId}`, {
    method: "DELETE",
  });
};

export const renameSetting = async (fileId: string, newName: string) => {
  const response = await fetch(`${API_URL}/settings/${fileId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: newName }),
  });
  return response.json();
};
