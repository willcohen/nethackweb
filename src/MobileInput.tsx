import { useEffect, useRef, useState } from "react";
import { useOnInput } from "./useNethack";
import { ESC } from "./nethack";

type Input = string | { input: string; label: string };

const getLabel = (input: Input) =>
	typeof input === "string" ? input : input.label;
const getInput = (input: Input) =>
	typeof input === "string" ? input : input.input;

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

export const catalogButtonChar = (id: string) => {
	const entry = catalogMap.get(id);
	return entry ? getLabel(entry.input) : "?";
};

export const resolveButtons = (ids: string[]): Input[] =>
	ids.map((id) => {
		const entry = catalogMap.get(id);
		if (!entry) throw new Error(`Unknown button id: ${id}`);
		return entry.input;
	});

export const INPUT_CATALOG_IDS = INPUT_CATALOG.map((b) => b.id);

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
}: {
	triggerOnPointerDown: boolean;
}) => {
	const onInput = useOnInput();
	const inputs = "kulnjbhy".split("");
	return (
		<div className="direction_input">
			<div className="corner top left" onClick={() => onInput("<")}>
				{"<"}
			</div>
			<div className="corner bottom left" onClick={() => onInput(">")}>
				{">"}
			</div>
			<div className="corner top right" onClick={() => onInput("s")}>
				{"s"}
			</div>
			<div className="corner bottom right" onClick={() => onInput(",")}>
				{","}
			</div>
			<svg
				version="1.1"
				width={200}
				height={200}
				viewBox="-200 -200 400 400"
			>
				{inputs.map((input, i) => (
					<SectorSVG
						key={i}
						start={i * 45 - 22.5}
						end={(i + 1) * 45 - 22.5}
						handleActivate={() => onInput(input)}
						triggerOnPointerDown={triggerOnPointerDown}
					/>
				))}
			</svg>
			<div
				className="center"
				style={{ touchAction: "none" }}
				onClick={() => onInput(".")}
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
					{input}
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
}: {
	triggerOnPointerDown: boolean;
	isNumLock: boolean;
	setIsNumLock: (isNumLock: boolean) => void;
	gridButtons: string[];
	scrollButtons: string[];
}) => {
	const onInput = useOnInput();
	const gridInputs = resolveButtons(gridButtons);
	const scrollInputs = resolveButtons(scrollButtons);

	const numberInputs: Input[] = [
		"7", "8", "9",
		"4", "5", "6",
		"1", "2", "3",
		";", "0",
	];

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
					{(isNumLock ? numberInputs : gridInputs).map(
						(input, i) => (
							<div
								key={i}
								className="simple_input"
								onClick={() => onInput(getInput(input))}
							>
								{getLabel(input)}
							</div>
						),
					)}
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
				<MobileDirInput triggerOnPointerDown={triggerOnPointerDown} />
			</div>
			<div
				ref={scrollRef}
				className={
					"simple_inputs" +
					(fadeLeft ? " fade-left" : "") +
					(fadeRight ? " fade-right" : "")
				}
			>
				{scrollInputs.map((input, i) => (
					<div
						key={i}
						className={"simple_input" + (i === 0 ? " toggle" : "")}
						onClick={() => onInput(getInput(input))}
					>
						{getLabel(input)}
					</div>
				))}
			</div>
		</>
	);
};
