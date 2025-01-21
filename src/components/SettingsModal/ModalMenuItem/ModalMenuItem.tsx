import React from "react";
import styles from "./ModalMenuItem.module.scss";
import { ToggleItemType } from "@/types/CommonTypes.js";
import { ToggleIcon } from "@/components/common/ToggleIcon.js";
import { DescriptionOutlined } from "@mui/icons-material";

interface ModalMenuItemProps {
	item: ToggleItemType;
	items: ToggleItemType[];
	handleTabToggle: (tabId: string) => void;
	handleTabOpen: (tabId: string) => void;
	indent: number;
}

export const ModalMenuItem: React.FC<ModalMenuItemProps> = ({
	item,
	items,
	handleTabToggle,
	handleTabOpen,
	indent,
}) => {
	const childrenIds = items
		.filter((f) => f.parentId === item.id)
		.map((f) => f.id);
	return (
		<div className={styles.itemWrapper}>
			<div className={styles.item} style={{ marginLeft: `${indent * 28}px` }}>
				{childrenIds && childrenIds.length > 0 && (
					<ToggleIcon
						isExpanded={item.isToggleOpen}
						handleTabToggle={handleTabToggle}
						id={item.id}
					/>
				)}
				{!childrenIds ||
					(childrenIds.length === 0 && (
						<DescriptionOutlined
							className={styles.itemIcon}
							style={{ fontSize: "medium" }}
						/>
					))}
				<div
					className={styles.itemName}
					onClick={() => {
						if (item.isFolder) {
							handleTabToggle(item.id);
						} else {
							handleTabOpen(item.id);
						}
					}}
				>
					{item.name}
				</div>
			</div>
			{item.isToggleOpen &&
				childrenIds &&
				childrenIds.length > 0 &&
				childrenIds.map((childId) => {
					const child = items.find((i) => i.id === childId);
					return (
						<ModalMenuItem
							key={childId}
							item={child}
							items={items}
							handleTabToggle={handleTabToggle}
							handleTabOpen={handleTabOpen}
							indent={indent + 1}
						/>
					);
				})}
		</div>
	);
};
