import React from "react";
import { KeyboardArrowRightRounded } from "@mui/icons-material";
import styles from "./ToggleIcon.module.scss";

interface ToggleIconProps {
	isExpanded: boolean;
	handleTabToggle: (id: string) => void;
	id: string;
}

export const ToggleIcon: React.FC<ToggleIconProps> = ({
	isExpanded,
	handleTabToggle,
	id,
}) => {
	return (
		<KeyboardArrowRightRounded
			className={`${styles.toggleIcon} ${isExpanded ? styles.expanded : ""}`}
			sx={{
				transition: "transform 0.3s ease",
				fontSize: "medium",
			}}
			onClick={() => handleTabToggle(id)}
		/>
	);
};
