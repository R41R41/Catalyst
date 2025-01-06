import { API_URL, BaseFileData } from "./apiTypes.js";

export const fetchScenarios = async (): Promise<BaseFileData[]> => {
	const response = await fetch(`${API_URL}/scenarios`);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	return await response.json();
};

export const createScenario = async (
	file: BaseFileData
): Promise<BaseFileData> => {
	const response = await fetch(`${API_URL}/scenarios`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(file),
	});
	return await response.json();
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
