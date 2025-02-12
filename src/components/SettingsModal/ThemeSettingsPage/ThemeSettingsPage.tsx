import React from "react";
import { useTheme } from "@/contexts/ThemeContext.js";
import styles from "./ThemeSettingsPage.module.scss";

export const ThemeSettingsPage: React.FC = () => {
	const { theme, toggleTheme } = useTheme();

	return (
		<div className={styles.themeSettings}>
			<h2>テーマ設定</h2>
			<div className={styles.themeOption}>
				<label>
					<input
						type="radio"
						name="theme"
						value="light"
						checked={theme === "light"}
						onChange={() => toggleTheme()}
					/>
					ライトモード
				</label>
				<label>
					<input
						type="radio"
						name="theme"
						value="dark"
						checked={theme === "dark"}
						onChange={() => toggleTheme()}
					/>
					ダークモード
				</label>
			</div>
		</div>
	);
};
