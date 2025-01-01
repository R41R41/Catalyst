import { API_URL, BaseFileData } from "./apiTypes";

export const fetchCharacters = async (): Promise<BaseFileData[]> => {
  const response = await fetch(`${API_URL}/characters`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

export const createCharacter = async (
  file: BaseFileData
): Promise<BaseFileData> => {
  const response = await fetch(`${API_URL}/characters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(file),
  });
  return await response.json();
};

export const updateCharacter = async (fileId: string, content: string) => {
  await fetch(`${API_URL}/characters/${fileId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
};

export const deleteCharacter = async (fileId: string) => {
  await fetch(`${API_URL}/characters/${fileId}`, {
    method: "DELETE",
  });
};

export const renameCharacter = async (fileId: string, newName: string) => {
  const response = await fetch(`${API_URL}/characters/${fileId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: newName }),
  });
  return response.json();
};
