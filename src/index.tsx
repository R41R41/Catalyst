import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./components/App/App.js";
import { ThemeProvider } from "@/contexts/ThemeContext.js";

try {
	const root = ReactDOM.createRoot(
		document.getElementById("root") as HTMLElement
	);

	root.render(
		<React.StrictMode>
			<ThemeProvider>
				<App />
			</ThemeProvider>
		</React.StrictMode>
	);
} catch (error) {
	console.error("Failed to start application:", error);
}
