import { useEffect, useRef, useState } from "react";
import { useOnInput } from "./useNethack";
import { ESC } from "./nethack";
import type { CustomButton, Settings } from "./settings";

type Input = string | { input: string; label: string };

const getLabel = (input: Input) =>
	typeof input === "string" ? input : input.label;
const getInput = (input: Input) =>
	typeof input === "string" ? input : input.input;

export type ResolvedAction =
	| { kind: "input"; input: Input }
	| { kind: "extcmd"; cmd: string };

export type ResolvedButton = {
	label: string;
	action: ResolvedAction;
};

const control = (input: string) => ({
	label: `^${input.toUpperCase()}`,
	input: String.fromCharCode(
		input.toLowerCase().charCodeAt(0) - "a".charCodeAt(0) + 1,
	),
});

const meta = (input: string) => ({
	label: `M-${input}`,
	input: String.fromCharCode(input.charCodeAt(0) | 0x80),
});

export type ButtonDef = {
	id: string;
	input: Input;
	label: string;
};

export const INPUT_CATALOG: ButtonDef[] = [
	{ id: "look", input: ":", label: "Look (:)" },
	{ id: "cast", input: "Z", label: "Cast (Z)" },
	{ id: "fire", input: "f", label: "Fire (f)" },
	{ id: "run", input: "G", label: "Run (G)" },
	{ id: "drop-type", input: "D", label: "Drop type (D)" },
	{ id: "inven", input: "i", label: "Inventory (i)" },
	{ id: "rush", input: "g", label: "Rush (g)" },
	{ id: "drop", input: "d", label: "Drop (d)" },
	{ id: "kick", input: control("D"), label: "Kick (^D)" },
	{ id: "travel", input: "_", label: "Travel (_)" },
	{ id: "loot", input: meta("l"), label: "Loot (M-l)" },

	{ id: "extcmd", input: "#", label: "# Extended" },
	{ id: "save", input: "S", label: "Save (S)" },
	{ id: "close", input: "c", label: "Close (c)" },
	{ id: "eat", input: "e", label: "Eat (e)" },
	{ id: "apply", input: "a", label: "Apply (a)" },
	{ id: "zap", input: "z", label: "Zap (z)" },
	{ id: "quaff", input: "q", label: "Quaff (q)" },
	{ id: "read", input: "r", label: "Read (r)" },
	{ id: "throw", input: "t", label: "Throw (t)" },
	{ id: "move", input: "m", label: "Move (m)" },
	{ id: "fight", input: "F", label: "Fight (F)" },
	{ id: "wield", input: "w", label: "Wield (w)" },
	{ id: "wear", input: "W", label: "Wear (W)" },
	{ id: "swap", input: "x", label: "Swap (x)" },
	{ id: "two-weapon", input: "X", label: "Two-weapon (X)" },
	{ id: "quiver", input: "Q", label: "Quiver (Q)" },
	{ id: "put-on", input: "P", label: "Put on (P)" },
	{ id: "takeoff", input: "T", label: "Take off (T)" },
	{ id: "remove", input: "R", label: "Remove (R)" },
	{ id: "open", input: "o", label: "Open (o)" },
	{ id: "inven-type", input: "I", label: "Inv. by type (I)" },
	{ id: "help", input: "?", label: "Help (?)" },
	{ id: "see-all", input: "*", label: "See all (*)" },
	{ id: "discoveries", input: "\\", label: "Discoveries (\\)" },
	{ id: "options", input: "O", label: "Options (O)" },
	{ id: "attributes", input: control("X"), label: "Attributes (^X)" },
	{ id: "esc", input: { label: "Esc", input: ESC }, label: "Escape" },
];

const catalogMap = new Map(INPUT_CATALOG.map((b) => [b.id, b]));

const customLabel = (custom: CustomButton) =>
	custom.label || `#${custom.extcmd}`;

export const buttonShortLabel = (
	id: string,
	customButtons: CustomButton[],
) => {
	const entry = catalogMap.get(id);
	if (entry) return getLabel(entry.input);
	const custom = customButtons.find((c) => c.id === id);
	if (custom) return customLabel(custom);
	return "?";
};

export const buttonFullLabel = (
	id: string,
	customButtons: CustomButton[],
) => {
	const entry = catalogMap.get(id);
	if (entry) return INPUT_CATALOG.find((b) => b.id === id)?.label ?? id;
	const custom = customButtons.find((c) => c.id === id);
	if (custom) return `${customLabel(custom)} (#${custom.extcmd})`;
	return id;
};

export const resolveButtons = (
	ids: string[],
	customButtons: CustomButton[],
): ResolvedButton[] =>
	ids.flatMap((id) => {
		const entry = catalogMap.get(id);
		if (entry) {
			return [
				{
					label: getLabel(entry.input),
					action: { kind: "input", input: entry.input } as ResolvedAction,
				},
			];
		}
		const custom = customButtons.find((c) => c.id === id);
		if (custom) {
			return [
				{
					label: customLabel(custom),
					action: { kind: "extcmd", cmd: custom.extcmd } as ResolvedAction,
				},
			];
		}
		return [];
	});

export const INPUT_CATALOG_IDS = INPUT_CATALOG.map((b) => b.id);

export const allButtonIds = (customButtons: CustomButton[]) => [
	...INPUT_CATALOG_IDS,
	...customButtons.map((c) => c.id),
];

const SectorSVG = ({
	start,
	end,
	handleActivate,
	triggerOnPointerDown,
}: {
	start: number;
	end: number;
	handleActivate: () => void;
	triggerOnPointerDown: boolean;
}) => {
	const angle1 = (start / 180) * Math.PI;
	const angle2 = (end / 180) * Math.PI;
	const polar = (angle: number, radius: number) =>
		`${(Math.sin(angle) * radius).toFixed(2)} ${(-Math.cos(angle) * radius).toFixed(2)}`;
	const d = `
		M ${polar(angle1, 60)}
		L ${polar(angle1, 180)}
		A 180 180 0 0 1 ${polar(angle2, 180)}
		L ${polar(angle2, 60)}
		A 60 60 0 0 0 ${polar(angle1, 60)}`;
	const props = {
		[triggerOnPointerDown ? "onPointerDown" : "onClick"]: handleActivate,
	};
	return <path d={d} {...props} />;
};

const MobileDirInput = ({
	triggerOnPointerDown,
	dispatchDir,
	shiftActive,
}: {
	triggerOnPointerDown: boolean;
	dispatchDir: (input: string) => void;
	shiftActive: boolean;
}) => {
	const inputs = "kulnjbhy".split("");
	const showLetter = (c: string) => (shiftActive ? c.toUpperCase() : c);
	return (
		<div className="direction_input">
			<div className="corner top left" onClick={() => dispatchDir("<")}>
				{"<"}
			</div>
			<div className="corner bottom left" onClick={() => dispatchDir(">")}>
				{">"}
			</div>
			<div className="corner top right" onClick={() => dispatchDir("s")}>
				{"s"}
			</div>
			<div className="corner bottom right" onClick={() => dispatchDir(",")}>
				{","}
			</div>
			<svg
				version="1.1"
				width="100%"
				height="100%"
				viewBox="-200 -200 400 400"
			>
				{inputs.map((input, i) => (
					<SectorSVG
						key={i}
						start={i * 45 - 22.5}
						end={(i + 1) * 45 - 22.5}
						handleActivate={() => dispatchDir(input)}
						triggerOnPointerDown={triggerOnPointerDown}
					/>
				))}
			</svg>
			<div
				className="center"
				style={{ touchAction: "none" }}
				onClick={() => dispatchDir(".")}
			>
				·
			</div>
			{inputs.map((input, i) => (
				<div
					key={i}
					className="label"
					style={{
						"--angle": `${i * 45}deg`,
					}}
				>
					{showLetter(input)}
				</div>
			))}
		</div>
	);
};

export const MobileInputs = ({
	triggerOnPointerDown,
	isNumLock,
	setIsNumLock,
	gridButtons,
	scrollButtons,
	customButtons,
	shiftMode,
}: {
	triggerOnPointerDown: boolean;
	isNumLock: boolean;
	setIsNumLock: (isNumLock: boolean) => void;
	gridButtons: string[];
	scrollButtons: string[];
	customButtons: CustomButton[];
	shiftMode: Settings["shiftMode"];
}) => {
	const onInput = useOnInput();
	const gridInputs = resolveButtons(gridButtons, customButtons);
	const scrollInputs = resolveButtons(scrollButtons, customButtons);
	const [shiftState, setShiftState] = useState<"idle" | "armed" | "locked">(
		"idle",
	);
	const lastShiftTapRef = useRef(0);
	const shiftActive = shiftState !== "idle";

	const handleShiftTap = () => {
		const now = Date.now();
		setShiftState((prev) => {
			if (prev === "idle") {
				lastShiftTapRef.current = now;
				return "armed";
			}
			if (prev === "armed") {
				if (now - lastShiftTapRef.current < 350) return "locked";
				return "idle";
			}
			return "idle";
		});
	};

	const dispatchDir = (input: string) => {
		const isDir = "hjklyubn".includes(input);
		const out = shiftActive && isDir ? input.toUpperCase() : input;
		onInput(out);
		if (shiftState === "armed" && isDir) setShiftState("idle");
	};

	const dispatch = (rb: ResolvedButton) => {
		if (rb.action.kind === "input") {
			onInput(getInput(rb.action.input));
		} else {
			onInput(["#", rb.action.cmd, { submit: true }]);
		}
	};

	const numberInputs: ResolvedButton[] = [
		"7", "8", "9",
		"4", "5", "6",
		"1", "2", "3",
		";", "0",
	].map((c) => ({ label: c, action: { kind: "input", input: c } }));

	const scrollRef = useRef<HTMLDivElement>(null);
	const [fadeLeft, setFadeLeft] = useState(false);
	const [fadeRight, setFadeRight] = useState(false);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		const update = () => {
			setFadeLeft(el.scrollLeft > 0);
			setFadeRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
		};
		update();
		el.addEventListener("scroll", update);
		return () => el.removeEventListener("scroll", update);
	}, [scrollInputs]);

	return (
		<>
			<div className="main-inputs">
				<div className="shortcut-inputs">
					{(isNumLock ? numberInputs : gridInputs).map((rb, i) => (
						<div
							key={i}
							className="simple_input"
							onClick={() => dispatch(rb)}
						>
							{rb.label}
						</div>
					))}
					<div
						className={
							"simple_input numlock" +
							(isNumLock ? " active" : "")
						}
						onClick={() => {
							setIsNumLock(!isNumLock);
						}}
					>
						{"123"}
					</div>
				</div>
				{shiftMode === "on" && (
					<div
						className={
							"shift-button" +
							(shiftState === "armed" ? " armed" : "") +
							(shiftState === "locked" ? " locked" : "")
						}
						aria-label="Shift"
						aria-pressed={shiftActive}
						onClick={handleShiftTap}
					>
						{shiftState === "locked" ? "⇑" : "↑"}
					</div>
				)}
				<MobileDirInput
					triggerOnPointerDown={triggerOnPointerDown}
					dispatchDir={dispatchDir}
					shiftActive={shiftActive}
				/>
			</div>
			<div
				ref={scrollRef}
				className={
					"simple_inputs" +
					(fadeLeft ? " fade-left" : "") +
					(fadeRight ? " fade-right" : "")
				}
			>
				{scrollInputs.map((rb, i) => (
					<div
						key={i}
						className={"simple_input" + (i === 0 ? " toggle" : "")}
						onClick={() => dispatch(rb)}
					>
						{rb.label}
					</div>
				))}
			</div>
		</>
	);
};
