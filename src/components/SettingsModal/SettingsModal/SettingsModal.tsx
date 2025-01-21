import React, { useState, useCallback, useEffect } from "react";
import styles from "./SettingsModal.module.scss";
import { PromptType, FlattenedItem } from "@/types/CommonTypes.js";
import { ModalMenu } from "@/components/SettingsModal/ModalMenu/ModalMenu.js";
import { ThemeSettingsPage } from "@/components/SettingsModal/ThemeSettingsPage/ThemeSettingsPage.js";
import { PromptEditorPage } from "@/components/SettingsModal/PromptEditorPage/PromptEditorPage.js";
import { ApiSettingsPage } from "@/components/SettingsModal/ApiSettingsPage/ApiSettingsPage.js";
import { InitiatePage } from "@/components/SettingsModal/InitiatePage/InitiatePage.js";
import { Test } from "@/components/SettingsModal/Test/Test.js";

interface SettingsModalProps {
	onClose: () => void;
	prompts: PromptType[];
	defaultPrompts: PromptType[];
	handleUpdatePrompt: (id: string, content: string) => void;
	handleSavePrompt: (id: string) => void;
	handleInitiate: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
	onClose,
	prompts,
	defaultPrompts,
	handleUpdatePrompt,
	handleSavePrompt,
	handleInitiate,
}) => {
	console.log("SettingsModal");
	console.log("prompts", prompts);
	console.log("defaultPrompts", defaultPrompts);
	const [toggleItems, setToggleItems] = useState<FlattenedItem[]>([]);

	useEffect(() => {
		const tabs = [
			{
				id: "prompts",
				name: "プロンプト",
				childrenIds: prompts.map((prompt) => prompt.id),
				isFolder: true,
			},
			{ id: "theme", name: "テーマ", childrenIds: [], isFolder: false },
			{ id: "openai", name: "OpenAI API", childrenIds: [], isFolder: false },
			{ id: "initiate", name: "データ", childrenIds: [], isFolder: false },
			{ id: "test", name: "テスト", childrenIds: [], isFolder: false },
		];
		const tabItems: FlattenedItem[] = tabs.map((tab) => ({
			id: tab.id,
			name: tab.name,
			isDirty: false,
			isFolder: tab.isFolder,
			isToggleOpen: false,
			isContentOpen: false,
			childrenIds: tab.childrenIds,
			parentId: null,
			depth: 0,
			index: 0,
		}));
		setToggleItems(tabItems);
		console.log("%c toggleItems", "color: red", toggleItems);
	}, [prompts]);

	const handleReset = async (id: string) => {
		const defaultPrompt = defaultPrompts.find((prompt) => prompt.id === id);
		if (defaultPrompt) {
			handleUpdatePrompt(id, defaultPrompt.content);
		}
	};

	const handleTabToggle = (tabId: string) => {
		setToggleItems(
			toggleItems.map((item) =>
				item.id === tabId ? { ...item, isToggleOpen: !item.isToggleOpen } : item
			)
		);
	};

	const handleTabOpen = (tabId: string) => {
		setToggleItems(
			toggleItems.map((item) =>
				item.id === tabId
					? { ...item, isContentOpen: true }
					: { ...item, isContentOpen: false }
			)
		);
	};

	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	const openedTabId = () => {
		let item = toggleItems.find((item) => item.isContentOpen);
		while (item?.parentId) {
			item = toggleItems.find((toggleItem) => toggleItem.id === item?.parentId);
		}
		return item?.id;
	};

	return (
		<div className={styles.overlay} onClick={handleOverlayClick}>
			<div className={styles.modal}>
				<div className={styles.header}>
					<span>設定</span>
					<button className={styles.closeButton} onClick={onClose}>
						×
					</button>
				</div>
				<div className={styles.container}>
					<ModalMenu
						toggleItems={toggleItems}
						handleTabToggle={handleTabToggle}
						handleTabOpen={handleTabOpen}
					/>
					<div className={styles.content}>
						{openedTabId() === "prompts" ? (
							<PromptEditorPage
								toggleItems={toggleItems}
								handleUpdatePrompt={handleUpdatePrompt}
								handleSavePrompt={handleSavePrompt}
								handleReset={handleReset}
							/>
						) : null}
						{openedTabId() === "theme" ? <ThemeSettingsPage /> : null}
						{openedTabId() === "openai" ? <ApiSettingsPage /> : null}
						{openedTabId() === "initiate" ? (
							<InitiatePage handleInitiate={handleInitiate} />
						) : null}
						{openedTabId() === "test" ? <Test /> : null}
					</div>
				</div>
			</div>
		</div>
	);
};

export default SettingsModal;
