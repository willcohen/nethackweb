// This file loads the WASM module and exports a function to start NetHack.
// It is the most raw form of the API.

// @ts-nocheck
import createModule from "../build/nethack.js";

// starts nethack
export const runNethackWasm = async (cb, Module = {}) => {
	globalThis.nethackCallback = cb;

	Module.onRuntimeInitialized = () => {
		// Swallow ExitStatus rejection: when NetHack exits (death/quit/save-on-hide),
		// emscripten throws ExitStatus through the asyncified call frame, rejecting
		// this promise. Without the catch it surfaces as an unhandled rejection.
		Module.ccall(
			"shim_graphics_set_callback",
			null,
			["string"],
			["nethackCallback"],
			{ async: true },
		).catch(() => {});
	};

	await createModule(Module);

	window.getValue = Module.getValue;
	window.setValue = Module.setValue;
	window.malloc = Module._malloc;
	window.FS = Module.FS;
	window.IDBFS = Module.IDBFS;
	window.UTF8ToString = Module.UTF8ToString;
	window.stringToUTF8 = Module.stringToUTF8;
};

declare global {
	const malloc: (size: number) => number;
}
