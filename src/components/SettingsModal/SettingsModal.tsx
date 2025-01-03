import React, { useState, useCallback, useEffect } from "react";
import styles from "./SettingsModal.module.scss";
import { Prompt } from "../../services/promptApi";
import { MenuItem } from "./MenuItem";
import { PromptsMenu } from "./PromptsMenu";

type SettingsTab = "prompts" | "theme" | "openai";
type SettingsSubTab = string | null;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
  onSavePrompts: (prompts: Prompt[]) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  prompts,
  onSavePrompts,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("prompts");
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>(null);
  const [expandedTabs, setExpandedTabs] = useState<string[]>([
    "prompts",
    "completion",
  ]);
  const [localPrompts, setLocalPrompts] = useState<Prompt[]>(prompts);

  useEffect(() => {
    setLocalPrompts(prompts);
  }, [prompts]);

  useEffect(() => {
    if (prompts.length > 0 && !activeSubTab) {
      setActiveSubTab(prompts[0].name);
    }
  }, [prompts, activeSubTab]);

  const isCurrentPromptModified = useCallback(() => {
    const currentPrompt = localPrompts.find((p) => p.name === activeSubTab);
    const originalPrompt = prompts.find((p) => p.name === activeSubTab);
    return currentPrompt?.content !== originalPrompt?.content;
  }, [localPrompts, prompts, activeSubTab]);

  const handlePromptChange = (content: string) => {
    const newPrompts = localPrompts.map((prompt) =>
      prompt.name === activeSubTab ? { ...prompt, content } : prompt
    );
    setLocalPrompts(newPrompts);
  };

  const handleSave = useCallback(() => {
    onSavePrompts(localPrompts);
  }, [localPrompts, onSavePrompts]);

  const toggleTab = (tabId: string) => {
    setExpandedTabs((prev) =>
      prev.includes(tabId) ? prev.filter((t) => t !== tabId) : [...prev, tabId]
    );
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "prompts":
        const currentPrompt = localPrompts.find((p) => p.name === activeSubTab);
        return currentPrompt ? (
          <div className={styles.promptEditor}>
            <textarea
              value={currentPrompt.content}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder="プロンプトの内容"
            />
            <div className={styles.buttonContainer}>
              <button
                className={`${styles.saveButton} ${
                  !isCurrentPromptModified() ? styles.disabled : ""
                }`}
                onClick={handleSave}
              >
                保存
              </button>
            </div>
          </div>
        ) : null;
      case "theme":
        return <div>テーマ設定（準備中）</div>;
      case "openai":
        return <div>OpenAI API設定（準備中）</div>;
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <div className={styles.container}>
          <div className={styles.sidebar}>
            <PromptsMenu
              activeTab={activeTab}
              activeSubTab={activeSubTab}
              expandedTabs={expandedTabs}
              prompts={prompts}
              onTabToggle={(tabId) => {
                toggleTab(tabId);
                if (tabId === "prompts") setActiveTab("prompts");
              }}
              onPromptSelect={(promptId) => {
                setActiveSubTab(promptId);
                setActiveTab("prompts");
              }}
            />
            <MenuItem
              title="Theme"
              isActive={activeTab === "theme"}
              isExpanded={expandedTabs.includes("theme")}
              onClick={() => toggleTab("theme")}
            />
            <MenuItem
              title="OpenAI API"
              isActive={activeTab === "openai"}
              isExpanded={expandedTabs.includes("openai")}
              onClick={() => toggleTab("openai")}
            />
          </div>
          <div className={styles.content}>{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
