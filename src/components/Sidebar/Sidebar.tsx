import React, { useMemo } from "react";
import styles from "./Sidebar.module.scss";
import { SortableFileMenu } from "@/components/SortableFileMenu/SortableFileMenu.js";
import type { TreeItem, TreeItems } from "@/types/CommonTypes.js";
// import { MenuItem } from "@/components/Sidebar/MenuItem/MenuItem.js";

interface SidebarProps {
	treeItems: TreeItems;
	// activeFileId: string;
	// handleFileToggle: (fileId: string) => void;
	handleContentOpen: (fileId: string) => void;
	handleCreateFile: (parentId: string, isFolder: boolean) => void;
	// handleRenameFile: (fileId: string, newName: string) => void;
	// handleDeleteFile: (fileId: string) => void;
	setTreeItems: (updater: (items: TreeItems) => TreeItems) => void;
	setContextMenuItems: (
		items: {
			label: string;
			onClick: () => void;
		}[]
	) => void;
	handleContextMenu: (event: React.MouseEvent) => void;
	handleCloseContextMenu: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
	treeItems,
	// activeFileId,
	// handleFileToggle,
	handleContentOpen,
	handleCreateFile,
	// handleRenameFile,
	// handleDeleteFile,
	setTreeItems,
	setContextMenuItems,
	handleContextMenu,
	handleCloseContextMenu,
}) => {
	const onContextMenu = (event: React.MouseEvent) => {
		handleContextMenu(event);
		setContextMenuItems([
			{
				label: "ファイルを新規作成",
				onClick: () => {
					handleCreateFile(null, false);
					handleCloseContextMenu();
				},
			},
			{
				label: "フォルダを新規作成",
				onClick: () => {
					handleCreateFile(null, true);
					handleCloseContextMenu();
				},
			},
		]);
	};

	return (
		<div className={styles.sidebar}>
			<SortableFileMenu
				collapsible
				indicator
				removable
				items={treeItems}
				setItems={setTreeItems}
				handleContentOpen={handleContentOpen}
			/>
			<div className={styles.emptyZone} onContextMenu={onContextMenu}></div>
		</div>
	);
};

export default Sidebar;
