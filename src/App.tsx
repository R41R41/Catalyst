import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import StoryEditor from './components/Editor';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  return (
    <div className="App" style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <PanelGroup direction="horizontal">
        <Panel defaultSize={70}>
          <StoryEditor />
        </Panel>
        <PanelResizeHandle />
        <Panel>
          <Chat />
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;
