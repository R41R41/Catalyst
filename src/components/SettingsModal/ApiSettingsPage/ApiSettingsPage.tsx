import React from "react";
import styles from "./ApiSettingsPage.module.scss";

export const ApiSettingsPage: React.FC = () => {
	return (
		<div className={styles.apiSettingsPage}>
			<h2>API設定</h2>
			<div className={styles.apiOption}>
				<label>
					<input type="radio" name="api" value="openai" checked={true} />
					OpenAI API
				</label>
			</div>
		</div>
	);
};
