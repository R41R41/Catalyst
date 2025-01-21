import React from "react";
import { ToggleItemType } from "@/types/CommonTypes.js";
import styles from "./ModalMenu.module.scss";
import { ModalMenuItem } from "@/components/SettingsModal/ModalMenuItem/ModalMenuItem.js";

interface ModalMenuProps {
	toggleItems: ToggleItemType[];
	handleTabToggle: (tabId: string) => void;
	handleTabOpen: (tabId: string) => void;
}

export const ModalMenu: React.FC<ModalMenuProps> = ({
	toggleItems,
	handleTabToggle,
	handleTabOpen,
}) => {
	const rootItems = toggleItems.filter((item) => item.parentId === null);

	return (
		<div className={styles.sidebar}>
			{rootItems.map((item) => (
				<ModalMenuItem
					key={item.id}
					item={item}
					items={toggleItems}
					handleTabToggle={handleTabToggle}
					handleTabOpen={handleTabOpen}
					indent={0}
				/>
			))}
		</div>
	);
};
