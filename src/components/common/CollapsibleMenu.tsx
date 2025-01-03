import React from "react";
import { ToggleIcon } from "./ToggleIcon";
import styles from "./CollapsibleMenu.module.scss";

interface MenuItemType {
  id: string;
  name: string;
  children?: MenuItemType[];
}

interface CollapsibleMenuProps {
  item: MenuItemType;
  level?: number;
  isExpanded?: boolean;
  activeItemId?: string;
  expandedIds: string[];
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  children?: React.ReactNode;
}

export const CollapsibleMenu: React.FC<CollapsibleMenuProps> = ({
  item,
  level = 0,
  isExpanded = false,
  activeItemId,
  expandedIds,
  onToggle,
  onSelect,
  children,
}) => {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className={styles.menuItem}>
      <div
        className={`${styles.menuHeader} ${level > 0 ? styles.indented : ""} ${
          activeItemId === item.id ? styles.active : ""
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
        {hasChildren && (
          <ToggleIcon isExpanded={expandedIds.includes(item.id)} />
        )}
        <span>{item.name}</span>
      </div>
      {hasChildren && (
        <div
          className={`${styles.submenu} ${
            expandedIds.includes(item.id) ? styles.expanded : ""
          }`}
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
              />
            ))}
        </div>
      )}
    </div>
  );
};
