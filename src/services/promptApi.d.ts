declare module "@/services/promptApi" {
  export interface Prompt {
    id: string;
    name: string;
    content: string;
  }

  export function fetchPrompts(): Promise<Prompt[]>;
  export function createPrompt(prompt: Prompt): Promise<Prompt>;
  // 他の関数や型をここに追加
}
