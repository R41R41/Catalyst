import React from "react";
import styles from "./InitiatePage.module.scss";

interface InitiatePageProps {
	handleInitiate: () => void;
}

export const InitiatePage: React.FC<InitiatePageProps> = ({
	handleInitiate,
}) => {
	return (
		<div className={styles.initiatePage}>
			<h2>データを初期化</h2>
			<div className={styles.initiateSection}>
				<button onClick={handleInitiate} className={styles.initiateButton}>
					データを初期化
				</button>
			</div>
		</div>
	);
};
