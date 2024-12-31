import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./components/App/App";

try {
  console.log("Starting application...");
  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );

  console.log("Root element found");
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Render completed");
} catch (error) {
  console.error("Failed to start application:", error);
}
