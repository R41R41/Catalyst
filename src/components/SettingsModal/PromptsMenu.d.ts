declare module "@/components/SettingsModal/PromptsMenu" {
  import React from "react";

  export interface PromptsMenuProps {
    activeTab: string;
    activeSubTab: string | null;
    expandedTabs: string[];
    prompts: any[]; // 実際の型に合わせて修正
    onTabToggle: (tabId: string) => void;
    onPromptSelect: (promptId: string) => void;
    dirtyPrompts: Set<string>;
  }

  export const PromptsMenu: React.FC<PromptsMenuProps>;
}
