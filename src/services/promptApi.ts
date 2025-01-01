const API_URL = `http://${process.env.REACT_APP_SERVER_IP_ADDRESS}:5000/api`;

export interface Prompt {
  id: string;
  name: string;
  content: string;
}

export const fetchPrompts = async (): Promise<Prompt[]> => {
  try {
    const response = await fetch(`${API_URL}/prompts`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching prompts:", error);
    throw error;
  }
};

export const createPrompt = async (prompt: Prompt): Promise<Prompt> => {
  const response = await fetch(`${API_URL}/prompts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(prompt),
  });
  return response.json();
};

export const updatePrompt = async (
  promptId: string,
  content: string
): Promise<Prompt> => {
  const response = await fetch(`${API_URL}/prompts/${promptId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  console.log("updatePrompt", response);
  return response.json();
};
