import { createReactInlineContentSpec } from "@blocknote/react";
import styles from "./Editor.module.scss";
import React from "react";

// カスタムインラインコンテンツの設定
const completionTextConfig = {
  type: "aiCompletion",
  propSchema: {
    text: {
      default: "",
    },
  },
  content: null,
};

// カスタムインラインコンテンツの実装
const completionTextImplementation = {
  render: (props) => (
    <span style={{ color: "#666" }}>{props.inlineContent.props.text}</span>
  ),
};

// カスタムインラインコンテンツを作成
const completionTextSpec = createReactInlineContentSpec(
  completionTextConfig,
  completionTextImplementation
);

export default completionTextSpec;
