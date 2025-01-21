import type { MutableRefObject } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";

export interface BaseItem {
	id: UniqueIdentifier;
	name: string;
	isDirty?: boolean;
	isFolder?: boolean;
	isToggleOpen: boolean;
	isContentOpen: boolean;
	isRetrieved?: boolean;
	content?: string;
	collapsed?: boolean;
}

export interface TreeItem extends BaseItem {
	children: TreeItem[];
}

export type TreeItems = TreeItem[];

export interface FlattenedItem extends BaseItem {
	parentId: UniqueIdentifier | null;
	depth: number;
	index: number;
	childrenIds: UniqueIdentifier[];
}

export type SensorContext = MutableRefObject<{
	items: FlattenedItem[];
	offset: number;
}>;

export interface PromptType extends TreeItem {}
