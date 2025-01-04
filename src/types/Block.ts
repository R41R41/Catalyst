export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "codeBlock";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  lastTypeChange?: number;
}
