import React from "react";
import { KeyboardArrowRight } from "@mui/icons-material";
import styles from "./PromptsMenu.module.scss";
import { MenuItem } from "./MenuItem";
import { Prompt } from "../../services/promptApi";
import { PROMPT_SECTIONS } from "./promptConstants";

interface PromptsMenuProps {
  activeTab: string;
  activeSubTab: string | null;
  expandedTabs: string[];
  prompts: Prompt[];
  onTabToggle: (tabId: string) => void;
  onPromptSelect: (promptId: string) => void;
}

export const PromptsMenu: React.FC<PromptsMenuProps> = ({
  activeTab,
  activeSubTab,
  expandedTabs,
  prompts,
  onTabToggle,
  onPromptSelect,
}) => {
  return (
    <MenuItem
      title="Prompts"
      isActive={activeTab === "prompts"}
      isExpanded={expandedTabs.includes("prompts")}
      onClick={() => onTabToggle("prompts")}
    >
      <div className={styles.submenu}>
        {PROMPT_SECTIONS.map((section) => (
          <div key={section.category} className={styles.submenuGroup}>
            <div
              className={styles.submenuHeader}
              onClick={() => onTabToggle(section.category)}
            >
              <KeyboardArrowRight
                className={
                  expandedTabs.includes(section.category) ? styles.expanded : ""
                }
              />
              <span>{section.name}</span>
            </div>
            <div
              className={`${styles.submenuItems} ${
                expandedTabs.includes(section.category) ? styles.expanded : ""
              }`}
            >
              {section.groups.map((group) => {
                const prompt = prompts.find((p) => p.name === group.id);
                return prompt ? (
                  <div
                    key={group.id}
                    className={`${styles.submenuItem} ${
                      activeSubTab === group.id ? styles.active : ""
                    }`}
                    onClick={() => onPromptSelect(group.id)}
                  >
                    {group.name}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </MenuItem>
  );
};
