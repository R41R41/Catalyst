import React from "react";
import { Settings as SettingsIcon } from "@mui/icons-material";
import styles from "./Header.module.scss";

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className={styles.header}>
      <div className={styles.title}>Catalyst</div>
      <button className={styles.settingsButton} onClick={onSettingsClick}>
        <SettingsIcon sx={{ fontSize: 20 }} />
      </button>
    </header>
  );
};
