export type PromptCategory = "completion" | "review";
export type PromptType = "character" | "setting" | "scenario";

export interface PromptGroup {
  id: string;
  name: string;
  type: PromptType;
}

export interface PromptSection {
  category: PromptCategory;
  name: string;
  groups: PromptGroup[];
}

export const PROMPT_SECTIONS = [
  {
    category: "predict",
    name: "補完",
    groups: [
      { id: "character", name: "キャラクター" },
      { id: "setting", name: "設定" },
      { id: "scenario", name: "シナリオ" },
    ],
  },
  {
    category: "review",
    name: "レビュー",
    groups: [
      { id: "character", name: "キャラクター" },
      { id: "setting", name: "設定" },
      { id: "scenario", name: "シナリオ" },
    ],
  },
];
