import React, { useState, useCallback, memo } from "react";
import { Block, BlockType } from "@/types/Block";
import BlockComponent from "./BlockComponent";
import styles from "./BlockEditor.module.scss";

// BlockComponentをメモ化
const MemoizedBlockComponent = memo(BlockComponent, (prev, next) => {
  return (
    prev.block.id === next.block.id &&
    prev.block.type === next.block.type &&
    prev.block.content === next.block.content &&
    prev.isSelected === next.isSelected
  );
});

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

const BlockEditor: React.FC<BlockEditorProps> = ({ blocks, onChange }) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const updateBlock = useCallback(
    async (blockId: string, updates: Partial<Block>) => {
      const newBlocks = blocks.map((block) =>
        block.id === blockId ? { ...block, ...updates } : block
      );
      onChange(newBlocks);
      console.log("blocks:", blocks);
    },
    [blocks, onChange]
  );

  const splitBlock = useCallback(
    (blockId: string) => {
      const block = blocks.find((b) => b.id === blockId);
      if (!block) return;

      const selection = window.getSelection();
      if (!selection || !selection.anchorNode) return;

      const content = block.content;
      const splitPoint = selection.anchorOffset;
      const beforeContent = content.slice(0, splitPoint);
      const afterContent = content.slice(splitPoint);

      const editedBlock: Block = {
        id: blockId,
        type: block.type,
        content: beforeContent,
      };

      const newBlock: Block = {
        id: crypto.randomUUID(),
        type: block.type,
        content: afterContent,
      };

      const blockIndex = blocks.findIndex((b) => b.id === blockId);
      const newBlocks = [
        ...blocks.slice(0, blockIndex),
        editedBlock,
        newBlock,
        ...blocks.slice(blockIndex + 1),
      ];
      onChange(newBlocks);
      setSelectedBlockId(newBlock.id);
    },
    [blocks, onChange, setSelectedBlockId]
  );

  const mergeWithPreviousBlock = useCallback(
    (currentBlock: Block, previousBlock: Block) => {
      const newBlocks = blocks
        .map((block) => {
          if (block.id === previousBlock.id) {
            return {
              ...block,
              content: block.content + currentBlock.content,
            };
          }
          return block;
        })
        .filter((b) => b.id !== currentBlock.id);

      onChange(newBlocks);
      setSelectedBlockId(previousBlock.id);
    },
    [blocks, onChange]
  );

  const deleteBlock = useCallback(
    (blockId: string) => {
      const blockIndex = blocks.findIndex((b) => b.id === blockId);
      const currentBlock = blocks[blockIndex];
      const previousBlock = blocks[blockIndex - 1];

      if (blockIndex === 0 && currentBlock.content === "") {
        if (blocks.length <= 1) return;
        const newBlocks = blocks.filter((b) => b.id !== blockId);
        onChange(newBlocks);
        setSelectedBlockId(blocks[1].id);
        return;
      }

      if (previousBlock) {
        mergeWithPreviousBlock(currentBlock, previousBlock);
      }
    },
    [blocks, onChange, mergeWithPreviousBlock]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, blockId: string) => {
      const currentBlock = blocks.find((b) => b.id === blockId);
      if (!currentBlock) return;

      if (shouldHandleBackspace(e, currentBlock)) {
        e.preventDefault();
        deleteBlock(blockId);
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        splitBlock(blockId);
        return;
      }

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const currentIndex = blocks.findIndex((b) => b.id === blockId);

        if (e.key === "ArrowUp" && currentIndex > 0) {
          setSelectedBlockId(blocks[currentIndex - 1].id);
        } else if (e.key === "ArrowDown" && currentIndex < blocks.length - 1) {
          setSelectedBlockId(blocks[currentIndex + 1].id);
        }
      }
    },
    [blocks, deleteBlock, splitBlock, setSelectedBlockId]
  );

  console.log("blocks:", blocks);

  return (
    <div className={styles.blockEditor}>
      {blocks.map((block) => (
        <MemoizedBlockComponent
          key={block.id}
          block={block}
          isSelected={block.id === selectedBlockId}
          onChange={(content) => updateBlock(block.id, { content })}
          onTypeChange={(type) => updateBlock(block.id, { type })}
          onSelect={() => setSelectedBlockId(block.id)}
          onKeyDown={(e) => handleKeyDown(e, block.id)}
        />
      ))}
    </div>
  );
};

// ユーティリティ関数
const shouldHandleBackspace = (e: React.KeyboardEvent, block: Block) => {
  if (e.key !== "Backspace") return false;
  const selection = window.getSelection();
  const isAtStart = selection?.anchorOffset === 0;
  return block.content === "" || isAtStart;
};

export default BlockEditor;
