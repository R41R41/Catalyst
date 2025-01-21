import { PromptType } from "@/types/CommonTypes.js";
import { API_URL } from "./apiTypes.js";

export const fetchDefaultPrompts = async (): Promise<PromptType[]> => {
	try {
		const response = await fetch(`${API_URL}/defaultPrompts`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		console.error("Error fetching default prompts:", error);
		throw error;
	}
};

export const fetchPrompts = async (): Promise<PromptType[]> => {
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

export const createPrompt = async (prompt: PromptType): Promise<PromptType> => {
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
): Promise<PromptType> => {
	const response = await fetch(`${API_URL}/prompts/${promptId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ content }),
	});
	return response.json();
};
