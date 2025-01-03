import React from "react";
import { CollapsibleMenu } from "../common/CollapsibleMenu";
import { PROMPT_SECTIONS } from "./promptConstants";
import { Prompt } from "@/services/promptApi";

interface PromptsMenuProps {
  activeTab: string;
  activeSubTab: string | null;
  expandedTabs: string[];
  prompts: Prompt[];
  onTabToggle: (tabId: string) => void;
  onPromptSelect: (promptId: string) => void;
  dirtyPrompts?: Set<string>;
}

export const PromptsMenu: React.FC<PromptsMenuProps> = ({
  activeTab,
  activeSubTab,
  expandedTabs,
  prompts,
  onTabToggle,
  onPromptSelect,
  dirtyPrompts = new Set(),
}) => {
  const menuStructure = {
    id: "prompts",
    name: "Prompts",
    children: PROMPT_SECTIONS.map((section) => ({
      id: section.category,
      name: section.name,
      children: section.groups.map((group) => ({
        id: `${section.category}_${group.id}`,
        name: group.name,
        children: [],
      })),
    })),
  };

  return (
    <CollapsibleMenu
      item={menuStructure}
      activeItemId={activeSubTab || undefined}
      expandedIds={expandedTabs}
      onToggle={onTabToggle}
      onSelect={onPromptSelect}
      dirtyItems={dirtyPrompts}
    ></CollapsibleMenu>
  );
};
