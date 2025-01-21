import React from "react";

import { SortableFileMenu } from "@/components/SortableFileMenu/SortableFileMenu.js";

export default {
	title: "Examples/Tree/Sortable",
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
	<div
		style={{
			maxWidth: 600,
			padding: 10,
			margin: "0 auto",
			marginTop: "10%",
		}}
	>
		{children}
	</div>
);

export const Test = () => (
	<Wrapper>
		<SortableFileMenu collapsible indicator removable />
	</Wrapper>
);
