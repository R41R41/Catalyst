import React from "react";
import { Settings as SettingsIcon } from "@mui/icons-material";
import styles from "./Header.module.scss";

interface HeaderProps {
	setIsModalOpen: (isOpen: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setIsModalOpen }) => {
	const handleSettingsClick = () => {
		setIsModalOpen(true);
	};
	return (
		<header className={styles.header}>
			<div className={styles.title}>Catalyst</div>
			<button className={styles.settingsButton} onClick={handleSettingsClick}>
				<SettingsIcon sx={{ fontSize: 20 }} />
			</button>
		</header>
	);
};
