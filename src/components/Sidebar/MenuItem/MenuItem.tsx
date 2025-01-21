import React, { useState, useMemo } from "react";
import styles from "./MenuItem.module.scss";
import { TreeItem } from "@/types/CommonTypes.js";
import { ToggleIcon } from "@/components/common/ToggleIcon.js";
import { DescriptionOutlined } from "@mui/icons-material";
import { Droppable, Draggable } from "@hello-pangea/dnd";

interface MenuItemProps {
	file: TreeItem;
	files: TreeItem[];
	activeFileId: string;
	handleFileToggle: (fileId: string) => void;
	handleContentOpen: (fileId: string) => void;
	handleCreateFile: (parentId: string, isFolder: boolean) => void;
	handleRenameFile: (fileId: string, newName: string) => void;
	handleDeleteFile: (fileId: string) => void;
	handleContextMenu: (event: React.MouseEvent) => void;
	handleCloseContextMenu: () => void;
	setContextMenuItems: (
		items: {
			label: string;
			onClick: () => void;
		}[]
	) => void;
	setFiles: (files: TreeItem[]) => void;
	indent: number;
}

export const MenuItem: React.FC<MenuItemProps> = ({
	file,
	files,
	activeFileId,
	handleFileToggle,
	handleContentOpen,
	handleCreateFile,
	handleRenameFile,
	handleDeleteFile,
	handleContextMenu,
	handleCloseContextMenu,
	setContextMenuItems,
	setFiles,
	indent,
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editName, setEditName] = useState(file.name);
	// console.log(
	// 	"filename",
	// 	file.name,
	// 	childFiles.map((file) => file.name)
	// );

	const onContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		handleContextMenu(e);
		setContextMenuItems([
			{
				label: "ファイルを新規作成",
				onClick: () => {
					handleCreateFile(file.id.toString(), false);
					handleCloseContextMenu();
				},
			},
			{
				label: "フォルダを新規作成",
				onClick: () => {
					handleCreateFile(file.id.toString(), true);
					handleCloseContextMenu();
				},
			},
			{
				label: "名前を変更",
				onClick: () => {
					setIsEditing(true);
					handleCloseContextMenu();
				},
			},
			{
				label: `この${file.isFolder ? "フォルダ" : "ファイル"}を削除`,
				onClick: () => {
					handleDeleteFile(file.id.toString());
					handleCloseContextMenu();
				},
			},
		]);
	};

	const childrenIds = files
		.filter((f) => f.id === file.id)
		.map((f) => f.id.toString());

	return (
		<>hello</>
		// <Draggable key={file.id} draggableId={file.id} index={file.index}>
		// 	{(provided, snapshot) => (
		// 		<div
		// 			ref={provided.innerRef}
		// 			{...provided.draggableProps}
		// 			{...provided.dragHandleProps}
		// 			className={`${styles.itemWrapper} ${
		// 				snapshot.isDragging ? styles.dragging : ""
		// 			}`}
		// 			style={provided.draggableProps.style}
		// 		>
		// 			<div
		// 				className={styles.item}
		// 				style={{ marginLeft: `${indent * 28}px` }}
		// 			>
		// 				{childrenIds && childrenIds.length > 0 && (
		// 					<ToggleIcon
		// 						isExpanded={file.isToggleOpen}
		// 						handleTabToggle={handleFileToggle}
		// 						id={file.id}
		// 					/>
		// 				)}
		// 				{!childrenIds ||
		// 					(childrenIds.length === 0 && (
		// 						<DescriptionOutlined
		// 							className={styles.itemIcon}
		// 							style={{ fontSize: "medium" }}
		// 						/>
		// 					))}
		// 				{isEditing ? (
		// 					<input
		// 						value={editName}
		// 						onChange={(e) => setEditName(e.target.value)}
		// 						onBlur={() => {
		// 							handleRenameFile(file.id, editName);
		// 							setIsEditing(false);
		// 						}}
		// 						onKeyPress={(e) => {
		// 							if (e.key === "Enter") {
		// 								handleRenameFile(file.id, editName);
		// 								setIsEditing(false);
		// 							}
		// 						}}
		// 						autoFocus
		// 					/>
		// 				) : (
		// 					<div
		// 						className={styles.itemName}
		// 						onClick={() => {
		// 							if (file.isFolder) {
		// 								handleFileToggle(file.id);
		// 							} else {
		// 								handleContentOpen(file.id);
		// 							}
		// 						}}
		// 						onContextMenu={onContextMenu}
		// 					>
		// 						{file.name}
		// 					</div>
		// 				)}
		// 			</div>
		// 			<Droppable droppableId={file.id} type="FILE">
		// 				{(provided2) => (
		// 					<div
		// 						{...provided2.droppableProps}
		// 						ref={provided2.innerRef}
		// 						className={styles.children}
		// 					>
		// 						{file.isToggleOpen &&
		// 							childrenIds &&
		// 							childrenIds.length > 0 &&
		// 							childFiles.map((child, childIndex) => {
		// 								return (
		// 									<MenuItem
		// 										key={child.id}
		// 										file={child}
		// 										files={files}
		// 										activeFileId={activeFileId}
		// 										handleFileToggle={handleFileToggle}
		// 										handleContentOpen={handleContentOpen}
		// 										handleCreateFile={handleCreateFile}
		// 										handleRenameFile={handleRenameFile}
		// 										handleDeleteFile={handleDeleteFile}
		// 										handleContextMenu={handleContextMenu}
		// 										handleCloseContextMenu={handleCloseContextMenu}
		// 										setContextMenuItems={setContextMenuItems}
		// 										setFiles={setFiles}
		// 										indent={length + indent + 1}
		// 									/>
		// 								);
		// 							})}
		// 						{provided2.placeholder}
		// 					</div>
		// 				)}
		// 			</Droppable>
		// 		</div>
		// 	)}
		// </Draggable>
	);
};
