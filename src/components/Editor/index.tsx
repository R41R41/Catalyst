import React from 'react';
import { Editor } from '@monaco-editor/react';

const StoryEditor: React.FC = () => {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Editor
        height="90vh"
        defaultLanguage="markdown"
        defaultValue="// ここに物語を書いてください"
        theme="vs-dark"
      />
    </div>
  );
};

export default StoryEditor; 