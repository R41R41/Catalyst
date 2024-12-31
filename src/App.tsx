import React from "react";
import StoryEditor from "./components/Editor";
import "./App.css";

function App() {
  return (
    <div className="App" style={{ display: "flex", height: "100vh" }}>
      <StoryEditor />
    </div>
  );
}

export default App;
