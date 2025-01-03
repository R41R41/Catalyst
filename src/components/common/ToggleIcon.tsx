import React from "react";
import { KeyboardArrowRight } from "@mui/icons-material";
import styles from "./ToggleIcon.module.scss";

interface ToggleIconProps {
  isExpanded: boolean;
  className?: string;
}

export const ToggleIcon: React.FC<ToggleIconProps> = ({
  isExpanded,
  className = "",
}) => {
  return (
    <KeyboardArrowRight
      className={`${styles.toggleIcon} ${
        isExpanded ? styles.expanded : ""
      } ${className}`}
      sx={{ transition: "transform 0.3s ease" }}
    />
  );
};
