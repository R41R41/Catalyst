import React, { useRef, useEffect } from "react";
import styles from "./ContextMenu.module.scss";

interface MenuItem {
  label: string;
  onClick: () => void;
}

interface ContextMenuProps {
  items: MenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  position,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className={styles.contextMenu}
      style={{
        left: position.x,
        top: position.y,
        position: "fixed",
      }}
    >
      {items.map((item, index) => (
        <button key={index} onClick={item.onClick}>
          {item.label}
        </button>
      ))}
    </div>
  );
};
