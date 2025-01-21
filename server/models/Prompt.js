import mongoose from "mongoose";
const promptSchema = new mongoose.Schema({
    id: String,
    name: String,
    content: String,
    isFolder: Boolean,
    isToggleOpen: Boolean,
    isContentOpen: Boolean,
    parentId: String,
});
export const Prompt = mongoose.model("Prompt", promptSchema);
const defaultPromptSchema = new mongoose.Schema({
    id: String,
    name: String,
    content: String,
    isFolder: Boolean,
    isToggleOpen: Boolean,
    isContentOpen: Boolean,
    parentId: String,
});
export const DefaultPrompt = mongoose.model("DefaultPrompt", defaultPromptSchema);
