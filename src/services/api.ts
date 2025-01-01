const API_URL = `http://${process.env.REACT_APP_SERVER_IP_ADDRESS}:5000/api`;

interface BaseFileData {
  id: string;
  name: string;
  content: string;
}

export const fetchScenarios = async (): Promise<BaseFileData[]> => {
  try {
    console.log("fetchScenarios");
    const response = await fetch(`${API_URL}/scenarios`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log("response", response);
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

export const createScenario = async (
  file: BaseFileData
): Promise<BaseFileData> => {
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

// キャラクター関連のAPI
export const fetchCharacters = async (): Promise<BaseFileData[]> => {
  console.log("fetchCharacters");
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

// 設定関連のAPI
export const fetchSettings = async (): Promise<BaseFileData[]> => {
  console.log("fetchSettings");
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
