// import React, { useCallback, useMemo } from "react";
// import { createEditor, Descendant } from "slate";
// import { Slate, Editable, withReact } from "slate-react";
// import { withHistory } from "slate-history";

// interface Editor3Props {
//   content: string;
//   onContentChange: (content: string) => void;
// }

// const Editor3: React.FC<Editor3Props> = ({ content, onContentChange }) => {
//   const editor = useMemo(() => withHistory(withReact(createEditor())), []);

//   const renderElement = useCallback((props: any) => {
//     return <p {...props.attributes}>{props.children}</p>;
//   }, []);

//   let initialValue: Descendant[];
//   try {
//     initialValue = JSON.parse(content);
//   } catch (error) {
//     console.error("Invalid JSON content, using default value:", error);
//     initialValue = [
//       {
//         children: [{ text: "A line of text in a paragraph." }],
//       },
//     ];
//   }

//   return (
//     <Slate
//       editor={editor}
//       initialValue={initialValue}
//       onChange={(newValue) => onContentChange(JSON.stringify(newValue))}
//     >
//       <Editable renderElement={renderElement} />
//       <button onClick={() => editor.undo()}>Undo</button>
//       <button onClick={() => editor.redo()}>Redo</button>
//     </Slate>
//   );
// };

// export default Editor3;
