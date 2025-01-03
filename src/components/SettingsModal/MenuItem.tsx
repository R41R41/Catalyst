import React from "react";
import { KeyboardArrowRight } from "@mui/icons-material";
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
        <KeyboardArrowRight className={isExpanded ? styles.expanded : ""} />
        <span>{title}</span>
      </div>
      {isExpanded && children}
    </div>
  );
};
