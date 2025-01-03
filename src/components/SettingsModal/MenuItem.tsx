import React from "react";
import { ToggleIcon } from "@/components/common/ToggleIcon";
import styles from "./MenuItem.module.scss";

interface MenuItemProps {
  title: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  title,
  isActive,
  isExpanded,
  onClick,
  children,
}) => {
  return (
    <div className={styles.menuItem}>
      <div
        className={`${styles.menuHeader} ${isActive ? styles.active : ""}`}
        onClick={onClick}
      >
        <ToggleIcon isExpanded={isExpanded} />
        <span>{title}</span>
      </div>
      {isExpanded && children}
    </div>
  );
};
