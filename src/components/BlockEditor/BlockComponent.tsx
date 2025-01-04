import React, { useRef, useEffect } from "react";
import { Block, BlockType } from "@/types/Block";
import styles from "./BlockComponent.module.scss";

interface BlockComponentProps {
  block: Block;
  isSelected: boolean;
  onChange: (content: string) => void;
  onTypeChange: (type: BlockType) => void;
  onSelect: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const BlockComponent: React.FC<BlockComponentProps> = ({
  block,
  isSelected,
  onChange,
  onTypeChange,
  onSelect,
  onKeyDown,
}) => {
  const blockRef = useRef<HTMLDivElement>({
    textContent: block.content,
  } as HTMLDivElement);
  const contentRef = useRef(block.content);
  const isComposingRef = useRef(false);
  const isTransformingRef = useRef(false);

  useEffect(() => {
    if (blockRef.current && block.content !== contentRef.current) {
      blockRef.current.textContent = block.content;
      contentRef.current = block.content;
    }
  }, [block.content]);

  useEffect(() => {
    if (isSelected && blockRef.current) {
      blockRef.current.focus();
    }
  }, [isSelected]);

  const handleMarkdownShortcut = (content: string) => {
    console.log("=== Markdown変換開始 ===");
    console.log("現在の状態:", {
      content,
      type: block.type,
      isTransforming: isTransformingRef.current,
    });

    if (isTransformingRef.current) {
      console.log("変換中のため、スキップ");
      return false;
    }

    const firstChars = content.slice(0, 3);
    const restContent = content.slice(
      firstChars.match(/^[#-]+\s/)?.[0].length || 0
    );

    isTransformingRef.current = true;

    if (firstChars.startsWith("# ")) {
      console.log("h1に変換");
      blockRef.current!.textContent = restContent;
      contentRef.current = restContent;
      onTypeChange("heading1");
      return true;
    } else if (firstChars.startsWith("## ")) {
      blockRef.current!.textContent = restContent;
      contentRef.current = restContent;
      onTypeChange("heading2");
      return true;
    } else if (firstChars.startsWith("### ")) {
      blockRef.current!.textContent = restContent;
      contentRef.current = restContent;
      onTypeChange("heading3");
      return true;
    } else if (firstChars.startsWith("- ")) {
      blockRef.current!.textContent = restContent;
      contentRef.current = restContent;
      onTypeChange("bulletList");
      return true;
    }

    isTransformingRef.current = false;
    return false;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isComposingRef.current) {
      return;
    }

    if (e.key === " " || e.code === "Space") {
      const content = blockRef.current?.textContent || "";
      if (
        content === "#" ||
        content === "##" ||
        content === "###" ||
        content === "-"
      ) {
        e.preventDefault();
        handleMarkdownShortcut(content + " ");
        return;
      }
    }

    onKeyDown(e);
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    console.log("=== Input イベント ===");
    console.log("現在の状態:", {
      content: e.currentTarget.textContent,
      type: block.type,
      isTransforming: isTransformingRef.current,
    });

    if (isTransformingRef.current) {
      console.log("変換中のため、スキップ");
      return;
    }

    const content = e.currentTarget.textContent || "";
    contentRef.current = content;

    if (content.match(/^[#-]+\s/)) {
      if (handleMarkdownShortcut(content)) {
        return;
      }
    }

    onChange(content);
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = () => {
    isComposingRef.current = false;
  };

  console.log("block:", block);
  console.log("blockRef:", blockRef.current);

  return (
    <div
      ref={blockRef}
      className={`${styles.block} ${styles[block.type]} ${
        isSelected ? styles.selected : ""
      }`}
      contentEditable="true"
      suppressContentEditableWarning
      onInput={handleInput}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      data-type={block.type}
    >
      {block.content}
    </div>
  );
};

export default BlockComponent;
