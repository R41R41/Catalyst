import React, { useState, useCallback, useEffect } from "react";
import styles from "./PromptModal.module.scss";
import { Prompt } from "../../services/promptApi";

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
  onSave: (prompts: Prompt[]) => void;
}

const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  onClose,
  prompts,
  onSave,
}) => {
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [localPrompts, setLocalPrompts] = useState<Prompt[]>(prompts);

  useEffect(() => {
    setLocalPrompts(prompts);
  }, [prompts]);

  // 現在選択されているプロンプトが変更されているかチェック
  const isCurrentPromptModified = useCallback(() => {
    return (
      localPrompts[selectedPromptIndex]?.content !==
      prompts[selectedPromptIndex]?.content
    );
  }, [localPrompts, prompts, selectedPromptIndex]);

  const handlePromptChange = (content: string) => {
    const newPrompts = [...localPrompts];
    newPrompts[selectedPromptIndex] = {
      ...localPrompts[selectedPromptIndex],
      content,
    };
    setLocalPrompts(newPrompts);
  };

  const handleSave = useCallback(() => {
    onSave(localPrompts);
  }, [localPrompts, onSave]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
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
            {localPrompts.map((prompt, index) => (
              <div
                key={index}
                className={`${styles.promptListItem} ${
                  selectedPromptIndex === index ? styles.active : ""
                }`}
                onClick={() => setSelectedPromptIndex(index)}
              >
                {prompt.name}
              </div>
            ))}
          </div>
          <div className={styles.editor}>
            {localPrompts[selectedPromptIndex] && (
              <>
                <textarea
                  value={localPrompts[selectedPromptIndex].content}
                  placeholder="プロンプトの内容"
                  onChange={(e) => handlePromptChange(e.target.value)}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;
