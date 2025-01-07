import React, { useState } from "react";
import { ToggleIcon } from "./ToggleIcon.js";
import styles from "./CollapsibleMenu.module.scss";
import { ContextMenu } from "@/components/common/ContextMenu.js";

interface MenuItemType {
	id: string;
	name: string;
	children?: MenuItemType[];
	isDirty?: boolean;
}

interface CollapsibleMenuProps {
	item: MenuItemType;
	level?: number;
	activeItemId?: string;
	expandedIds: string[];
	onToggle: (id: string) => void;
	onSelect: (id: string) => void;
	children?: React.ReactNode;
	dirtyItems?: Set<string>;
	canCreateFolder?: boolean;
	canCreateFile?: boolean;
	onCreateFolder?: (id: string) => void;
	onCreateFile?: (id: string) => void;
}

export const CollapsibleMenu: React.FC<CollapsibleMenuProps> = ({
	item,
	level = 0,
	activeItemId,
	expandedIds,
	onToggle,
	onSelect,
	children,
	dirtyItems = new Set(),
	canCreateFolder = false,
	canCreateFile = false,
	onCreateFolder,
	onCreateFile,
}) => {
	const hasChildren = item.children && item.children.length > 0;
	const isActive = activeItemId === item.id;
	const isExpanded = expandedIds.includes(item.id);
	const isDirty = dirtyItems.has(item.id) || item.isDirty;

	const [contextMenu, setContextMenu] = useState<{
		x: number;
		y: number;
	} | null>(null);

	const handleContextMenu = (event: React.MouseEvent) => {
		event.preventDefault();
		setContextMenu({ x: event.clientX, y: event.clientY });
	};

	const handleCloseContextMenu = () => {
		setContextMenu(null);
	};

	return (
		<div className={styles.menuItem}>
			<div
				className={`${styles.menuHeader} ${isActive ? styles.active : ""} ${
					isDirty ? styles.dirty : ""
				}`}
				style={{ paddingLeft: `${12 + level * 20}px` }}
				onClick={() => {
					if (hasChildren) {
						onToggle(item.id);
					} else {
						onSelect(item.id);
					}
				}}
				onContextMenu={handleContextMenu}
			>
				{hasChildren && <ToggleIcon isExpanded={isExpanded} />}
				<span>{item.name}</span>
			</div>
			{
				<div
					className={`${styles.submenu} ${isExpanded ? styles.expanded : ""}`}
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
								dirtyItems={dirtyItems}
								canCreateFolder={canCreateFolder}
								canCreateFile={canCreateFile}
								onCreateFolder={onCreateFolder}
								onCreateFile={onCreateFile}
							/>
						))}
				</div>
			}
			{contextMenu && (
				<ContextMenu
					items={[
						...(canCreateFile
							? [
									{
										label: "ファイルを新規作成",
										onClick: () => onCreateFile && onCreateFile(item.id),
									},
							  ]
							: []),
						...(canCreateFolder
							? [
									{
										label: "フォルダを新規作成",
										onClick: () => onCreateFolder && onCreateFolder(item.id),
									},
							  ]
							: []),
					]}
					position={contextMenu}
					onClose={handleCloseContextMenu}
				/>
			)}
		</div>
	);
};
