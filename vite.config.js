// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import commonjs from "@rollup/plugin-commonjs";
import path from "path";

export default defineConfig({
	plugins: [
		react(),
		commonjs({
			include: "node_modules/**", // CommonJS モジュールの変換を許可
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@chatscope": path.resolve(__dirname, "./node_modules/@chatscope"),
		},
	},
	server: {
		port: 3000,
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@use "@/styles/variables" as *;`,
			},
		},
	},
});
