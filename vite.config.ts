import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const buildMonth = new Date().toLocaleString("en-US", {
	month: "long",
	year: "numeric",
});

// https://vite.dev/config/
export default defineConfig({
	base: "",
	define: {
		__BUILD_MONTH__: JSON.stringify(buildMonth),
	},
	plugins: [
		react({
			babel: {
				// plugins: ["./tools/babel-plugin-auto-observe.js"],
			},
		}),
	],
});
