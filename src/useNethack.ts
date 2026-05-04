import { createContext, useContext, useState } from "react";
import { Input, NetHack, startNetHack } from "./nethack";

export type OnInput = (input: Input | Input[]) => void;

const clone = <T>(x: T) => JSON.parse(JSON.stringify(x)) as T;
export const useNethack = () => {
	const [onInput, setOnInput] = useState<OnInput>(() => () => {});
	const [state, setState] = useState<NetHack>(() =>
		startNetHack((nethack) => {
			// This is very much a hack, but it works
			const cloned = clone(nethack);
			// Unclone the map for performance
			cloned.mapWindow = nethack.mapWindow;
			setState(cloned);
			setOnInput(() => (input: Input | Input[]) => nethack.onInput(input));
		}),
	);
	return [state, onInput] as const;
};

export const OnInputContext = createContext<OnInput | null>(null);

export const useOnInput = (): OnInput => {
	const onInput = useContext(OnInputContext);
	if (onInput === null) {
		throw new Error("useOnInput must be used within a OnInputProvider");
	}
	return onInput;
};
