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

export const PROMPT_SECTIONS: PromptSection[] = [
  {
    category: "completion",
    name: "補完",
    groups: [
      { id: "predict_character", name: "キャラクター", type: "character" },
      { id: "predict_setting", name: "設定", type: "setting" },
      { id: "predict_scenario", name: "シナリオ", type: "scenario" },
    ],
  },
  {
    category: "review",
    name: "レビュー",
    groups: [
      { id: "review_character", name: "キャラクター", type: "character" },
      { id: "review_setting", name: "設定", type: "setting" },
      { id: "review_scenario", name: "シナリオ", type: "scenario" },
    ],
  },
];
