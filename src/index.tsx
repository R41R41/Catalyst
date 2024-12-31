import React from 'react';
import ReactDOM from 'react-dom/client';
import StoryEditor from './components/Editor';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <StoryEditor />
  </React.StrictMode>
);
