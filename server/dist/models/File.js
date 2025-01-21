import mongoose from "mongoose";
const fileSchema = new mongoose.Schema({
    id: String,
    name: String,
    content: String,
    isFolder: Boolean,
    isToggleOpen: Boolean,
    isContentOpen: Boolean,
    parentId: String,
    index: Number,
}, { timestamps: true });
export const File = mongoose.model("File", fileSchema);
