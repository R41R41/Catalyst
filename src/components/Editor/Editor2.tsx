import "@blocknote/core/fonts/inter.css";
import { useBlockNote, useCreateBlockNote } from "@blocknote/react";
import { BlockNoteSchema, defaultInlineContentSpecs } from "@blocknote/core";
import "@blocknote/mantine/style.css";
import { BlockNoteView } from "@blocknote/mantine";
import "./Editor2.css";
import styles from "./Editor.module.scss";
import React, { useEffect, useRef, useCallback, useState } from "react";
import { getCompletion, findRelatedContents } from "@/services/openai.js";
import { Prompt } from "@/services/promptApi.js";
import { FileCategory, FileData } from "@/types/File.js";
import completionTextSpec from "./AiCompletion.js";

interface EditorProps {
  content: string;
  category: FileCategory;
  onContentChange: (content: string) => void;
  systemPrompts: Prompt[];
  allFiles: FileData[];
  currentFileName: string;
  onSave: () => void;
  isDirty: boolean;
}
const Editor2: React.FC<EditorProps> = ({
  content,
  category,
  onContentChange,
  systemPrompts,
  allFiles,
  currentFileName,
  onSave,
}) => {
  const schema = BlockNoteSchema.create({
    inlineContentSpecs: {
      // Adds all default inline content.
      ...defaultInlineContentSpecs,
      // Adds the mention tag.
      aiCompletion: completionTextSpec,
    },
  });

  const editor = useCreateBlockNote({ schema });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const originalContentRef = useRef<string>("");

  useEffect(() => {
    const loadContent = async () => {
      if (!editor || !currentFileName) return;
      const blocks = await editor.tryParseMarkdownToBlocks(content);
      editor.replaceBlocks(editor.document, blocks);
    };
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, currentFileName]);

  const handleEditorChange = useCallback(async () => {
    if (!editor) return;
    const document = editor.document;
    const aiCompletionInlineContent = document.find((block) => {
      const content = block.content;
      let i = 0;
      let isAiCompletion = false;
      while (content[i] && !isAiCompletion) {
        if (content[i].type === "aiCompletion") {
          isAiCompletion = true;
        }
        i++;
      }
      return isAiCompletion;
    });
    if (aiCompletionInlineContent) return;

    const cursorPosition = editor.getTextCursorPosition();
    const currentBlock = cursorPosition.block;
    const blockContent = currentBlock.content; // 現在のブロックの内容を取得

    console.log("cursorPosition", cursorPosition);

    const markdown = await editor.blocksToMarkdownLossy(editor.document);

    // カーソル位置より前のテキストを抽出
    const cursorText = cursorPosition.block.content[0]?.text;
    console.log("cursorText", cursorText);

    if (onContentChange) {
      onContentChange(markdown);
    }

    // 既存のタイマーをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 新しいタイマーをセット
    timeoutRef.current = setTimeout(async () => {
      try {
        if (!cursorText) return;
        originalContentRef.current = cursorText;

        const relatedContents = await findRelatedContents(
          currentFileName,
          cursorText,
          allFiles
        );
        const systemPrompt = systemPrompts.find(
          (prompt) => prompt.name === `predict_${category}`
        );

        if (!systemPrompt) {
          console.error("System prompt not found");
          return;
        }

        console.log("getCompletion start");
        const result = await getCompletion(
          currentFileName,
          cursorText,
          systemPrompt,
          relatedContents
        );

        if (result && cursorText === originalContentRef.current) {
          editor.focus();
          editor.insertBlocks(
            [
              {
                type: "paragraph",
                content: [
                  {
                    type: "aiCompletion",
                    props: {
                      text: result,
                    },
                  },
                ],
              },
            ],
            cursorPosition.block,
            "after"
          );
        }
      } catch (error) {
        console.error("Completion error:", error);
      }
    }, 3000);
  }, [
    editor,
    onContentChange,
    currentFileName,
    category,
    systemPrompts,
    allFiles,
  ]);

  return (
    <div className={styles.editor}>
      <BlockNoteView
        editor={editor}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === "s") {
            event.preventDefault();
            onSave();
            return true;
          }

          // Tabキーが押されたときの処理
          if (event.key === "Tab") {
            const document = editor.document;
            const aiCompletionBlock = document.find((block) => {
              const content = block.content;
              let i = 0;
              let isAiCompletion = false;
              while (content[i] && !isAiCompletion) {
                if (content[i].type === "aiCompletion") {
                  isAiCompletion = true;
                }
                i++;
              }
              return isAiCompletion;
            });
            if (!aiCompletionBlock) return;
            event.preventDefault();
            event.stopPropagation();
            const aiCompletionText = aiCompletionBlock.content[0].props.text;
            // Example to change a block type to paragraph
            console.log("aiCompletionText", aiCompletionText);
            editor.updateBlock(aiCompletionBlock, {
              type: "paragraph",
              content: aiCompletionText,
            });
          } else {
            const document = editor.document;
            const aiCompletionBlock = document.find((block) => {
              const content = block.content;
              let i = 0;
              let isAiCompletion = false;
              while (content[i] && !isAiCompletion) {
                if (content[i].type === "aiCompletion") {
                  isAiCompletion = true;
                }
                i++;
              }
              return isAiCompletion;
            });
            if (!aiCompletionBlock) return;
            editor.removeBlocks([aiCompletionBlock]);
          }
        }}
        onChange={handleEditorChange}
      />
    </div>
  );
};

export default Editor2;
