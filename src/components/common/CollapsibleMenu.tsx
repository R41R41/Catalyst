import React from "react";
import { ToggleIcon } from "./ToggleIcon";
import styles from "./CollapsibleMenu.module.scss";

interface MenuItemType {
  id: string;
  name: string;
  children?: MenuItemType[];
  isDirty?: boolean;
}

interface CollapsibleMenuProps {
  item: MenuItemType;
  level?: number;
  activeItemId?: string;
  expandedIds: string[];
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  children?: React.ReactNode;
  dirtyItems?: Set<string>;
}

export const CollapsibleMenu: React.FC<CollapsibleMenuProps> = ({
  item,
  level = 0,
  activeItemId,
  expandedIds,
  onToggle,
  onSelect,
  children,
  dirtyItems = new Set(),
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isActive = activeItemId === item.id;
  const isExpanded = expandedIds.includes(item.id);
  const isDirty = dirtyItems.has(item.id) || item.isDirty;

  return (
    <div className={styles.menuItem}>
      <div
        className={`${styles.menuHeader} ${isActive ? styles.active : ""} ${
          isDirty ? styles.dirty : ""
        }`}
        style={{ paddingLeft: `${12 + level * 20}px` }}
        onClick={() => {
          if (hasChildren) {
            onToggle(item.id);
          } else {
            onSelect(item.id);
          }
        }}
      >
        {hasChildren && <ToggleIcon isExpanded={isExpanded} />}
        <span>{item.name}</span>
      </div>
      {hasChildren && (
        <div
          className={`${styles.submenu} ${isExpanded ? styles.expanded : ""}`}
        >
          {children ||
            item.children?.map((child) => (
              <CollapsibleMenu
                key={child.id}
                item={child}
                level={level + 1}
                activeItemId={activeItemId}
                expandedIds={expandedIds}
                onToggle={onToggle}
                onSelect={onSelect}
                dirtyItems={dirtyItems}
              />
            ))}
        </div>
      )}
    </div>
  );
};
