import { API_URL } from "./apiTypes.js";
import { FileType } from "@/types/CommonTypes.js";

export const fetchFiles = async (): Promise<FileType[]> => {
	const response = await fetch(`${API_URL}/files`);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	return await response.json();
};

export const createFile = async (file: FileType): Promise<FileType> => {
	const response = await fetch(`${API_URL}/files`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(file),
	});
	return await response.json();
};

export const deleteFile = async (fileId: string) => {
	await fetch(`${API_URL}/files/${fileId}`, {
		method: "DELETE",
	});
};

export const updateFileName = async (fileId: string, newName: string) => {
	const response = await fetch(`${API_URL}/files/${fileId}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name: newName }),
	});
	return await response.json();
};

export const updateFileContent = async (fileId: string, content: string) => {
	const response = await fetch(`${API_URL}/files/${fileId}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ content }),
	});
	return await response.json();
};

export const updateAllFiles = async (files: FileType[]) => {
	const response = await fetch(`${API_URL}/files`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(files),
	});
	return await response.json();
};

export const deleteAllFiles = async () => {
	await fetch(`${API_URL}/files`, {
		method: "DELETE",
	});
};
