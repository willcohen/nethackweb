import nethackrcContents from "./nethackrc.txt?raw";

export type Settings = {
	version: 1;
	playerName: string;
	nethackrc: string;
	compactStatus: boolean;
	saveOnHide: boolean;
	gridButtons: string[];
	scrollButtons: string[];
	shiftMode: "off" | "sticky" | "hold";
};

const STORAGE_KEY = "nethackweb";

// Avoid names in NetHack 5.0's sysconf `genericusers` list (default: play,
// player, game, games, nethack, nethacker, ec2-user). NetHack zeroes those
// out and forces askname, which loops without a working prompt.
const defaults = (): Settings => ({
	version: 1,
	playerName: "Adventurer",
	nethackrc: nethackrcContents,
	compactStatus: window.matchMedia("(max-width: 600px)").matches,
	saveOnHide: true,
	gridButtons: [
		"look", "cast", "fire",
		"run", "drop-type", "inven",
		"rush", "drop", "kick",
		"travel", "loot",
	],
	scrollButtons: [
		"extcmd", "save", "close", "eat", "apply", "zap", "quaff", "read",
		"throw", "move", "fight", "wield", "wear", "swap", "two-weapon",
		"quiver", "put-on", "takeoff", "remove", "open", "inven-type",
		"help", "see-all", "discoveries", "options", "attributes", "esc",
	],
	shiftMode: "sticky",
});

export const loadSettings = (): Settings => {
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return defaults();
	try {
		const stored = JSON.parse(raw) as Partial<Settings>;
		return { ...defaults(), ...stored, version: 1 };
	} catch {
		return defaults();
	}
};

export const saveSettings = (settings: Settings): void => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};
