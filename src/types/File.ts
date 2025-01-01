export type FileCategory = "character" | "setting" | "scenario";

export interface FileData {
  id: string;
  name: string;
  content: string;
  category: FileCategory;
}
