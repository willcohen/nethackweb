import { Dispatch, SetStateAction, useState } from "react";
import nethackrcContents from "./nethackrc.txt?raw";
import { Modal } from "./Modal";
import { loadSettings, Settings } from "./settings";
import {
	INPUT_CATALOG,
	INPUT_CATALOG_IDS,
	ButtonDef,
	catalogButtonChar,
} from "./MobileInput";

type SubModal = null | "rc" | "reset-rc" | "reset-all";

const catalogLabel = (id: string) =>
	INPUT_CATALOG.find((b: ButtonDef) => b.id === id)?.label ?? id;

export const SettingsDialog = ({
	settings,
	updateSettings,
	setSettings,
	onClose,
}: {
	settings: Settings;
	updateSettings: (patch: Partial<Settings>) => void;
	setSettings: Dispatch<SetStateAction<Settings>>;
	onClose: () => void;
}) => {
	const [sub, setSub] = useState<SubModal>(null);

	const toggleScroll = (id: string) => {
		const present = settings.scrollButtons.includes(id);
		if (present) {
			updateSettings({
				scrollButtons: settings.scrollButtons.filter((b) => b !== id),
			});
		} else {
			const inserted = [...settings.scrollButtons, id].sort(
				(a, b) => INPUT_CATALOG_IDS.indexOf(a) - INPUT_CATALOG_IDS.indexOf(b),
			);
			updateSettings({ scrollButtons: inserted });
		}
	};

	return (
		<Modal title="Settings" onClose={onClose}>
			<div className="settings-row">
				<label className="settings-label" htmlFor="settings-playername">
					Default player name
				</label>
				<input
					id="settings-playername"
					type="text"
					value={settings.playerName}
					onChange={(e) => updateSettings({ playerName: e.target.value })}
				/>
				<div className="settings-note">
					Used for new games. Existing saves keep their original name.
				</div>
			</div>

			<div className="settings-row">
				<label>
					<input
						type="checkbox"
						checked={settings.compactStatus}
						onChange={(e) =>
							updateSettings({ compactStatus: e.target.checked })
						}
					/>{" "}
					Compact status bar
				</label>
			</div>

			<div className="settings-row">
				<label>
					<input
						type="checkbox"
						checked={settings.saveOnHide}
						onChange={(e) =>
							updateSettings({ saveOnHide: e.target.checked })
						}
					/>{" "}
					Save when app loses focus
				</label>
				<div className="settings-note">
					Flushes the game to local storage when you switch tabs or
					hide the window.
				</div>
			</div>

			<div className="settings-row">
				<div className="settings-label">Shift behavior</div>
				{(["off", "sticky", "hold"] as const).map((mode) => (
					<label key={mode} className="settings-radio">
						<input
							type="radio"
							name="shiftMode"
							value={mode}
							checked={settings.shiftMode === mode}
							onChange={() => updateSettings({ shiftMode: mode })}
						/>{" "}
						{mode}
					</label>
				))}
				<div className="settings-note">
					Sticky: tap once, the next direction sends uppercase. Hold:
					press and hold while tapping a direction.
				</div>
			</div>

			<div className="settings-row">
				<div className="settings-label">Grid buttons</div>
				<div className="settings-grid-slots">
					{settings.gridButtons.map((id, i) => (
						<select
							key={i}
							className="settings-grid-slot"
							value={id}
							onChange={(e) => {
								const updated = [...settings.gridButtons];
								updated[i] = e.target.value;
								updateSettings({ gridButtons: updated });
							}}
						>
							{INPUT_CATALOG_IDS.map((cid) => (
								<option key={cid} value={cid}>
									{catalogButtonChar(cid)}
								</option>
							))}
						</select>
					))}
				</div>
			</div>

			<div className="settings-row">
				<div className="settings-label">Scroll buttons</div>
				<div className="settings-toolbar-grid">
					{INPUT_CATALOG_IDS.map((id) => (
						<label key={id}>
							<input
								type="checkbox"
								checked={settings.scrollButtons.includes(id)}
								onChange={() => toggleScroll(id)}
							/>{" "}
							{catalogLabel(id)}
						</label>
					))}
				</div>
			</div>

			<div className="settings-row">
				<button onClick={() => setSub("rc")}>Edit nethackrc</button>{" "}
				<button onClick={() => setSub("reset-rc")}>
					Reset rc to default
				</button>{" "}
				<button onClick={() => setSub("reset-all")}>
					Reset all settings
				</button>
			</div>

			{sub === "rc" && (
				<Modal title="Edit nethackrc" onClose={() => setSub(null)}>
					<textarea
						className="settings-rc-textarea"
						value={settings.nethackrc}
						onChange={(e) =>
							updateSettings({ nethackrc: e.target.value })
						}
					/>
					<div className="settings-note">
						Changes apply on the next game start.
					</div>
				</Modal>
			)}

			{sub === "reset-rc" && (
				<Modal title="Reset rc to default?" onClose={() => setSub(null)}>
					<p>
						This replaces your nethackrc with the bundled default.
						Other settings are not affected.
					</p>
					<button
						onClick={() => {
							updateSettings({ nethackrc: nethackrcContents });
							setSub(null);
						}}
					>
						Reset
					</button>{" "}
					<button onClick={() => setSub(null)}>Cancel</button>
				</Modal>
			)}

			{sub === "reset-all" && (
				<Modal
					title="Reset all settings?"
					onClose={() => setSub(null)}
				>
					<p>
						This replaces every setting with defaults. Saves in
						browser storage are not affected.
					</p>
					<button
						onClick={() => {
							localStorage.removeItem("nethackweb");
							setSettings(loadSettings());
							setSub(null);
						}}
					>
						Reset
					</button>{" "}
					<button onClick={() => setSub(null)}>Cancel</button>
				</Modal>
			)}
		</Modal>
	);
};
