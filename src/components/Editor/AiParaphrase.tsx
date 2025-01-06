import { useBlockNoteEditor, useComponentsContext } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import React from "react";

// Custom Formatting Toolbar Button to toggle blue text & background color.
export function AiParaphrase() {
  const editor = useBlockNoteEditor();

  const Components = useComponentsContext()!;

  return (
    <Components.FormattingToolbar.Button
      mainTooltip={"自動修正を生成"}
      onClick={() => {
        const selectedText = editor.getSelectedText();
        const selectedBlock = editor.getSelection()?.blocks[0];
        const contents = selectedBlock?.content;
        let i = 0;
        while (contents[i]) {
          if (contents[i].text.includes(selectedText)) {
            contents[i].text = contents[i].text.replace(
              selectedText,
              "自動修正"
            );
          }
          i++;
        }
        editor.updateBlock(selectedBlock, { content: contents });
      }}
      isSelected={true}
    >
      自動修正
    </Components.FormattingToolbar.Button>
  );
}
