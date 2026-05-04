import { useState } from "react";
import nethackrcContents from "./nethackrc.txt?raw";
import { Modal } from "./Modal";
import { loadSettings, saveSettings, Settings } from "./settings";

type SubModal = null | "rc" | "reset-rc" | "reset-all";

export const SettingsDialog = ({ onClose }: { onClose: () => void }) => {
	const [settings, setSettings] = useState<Settings>(() => loadSettings());
	const [sub, setSub] = useState<SubModal>(null);

	const update = (patch: Partial<Settings>) => {
		const next = { ...settings, ...patch };
		setSettings(next);
		saveSettings(next);
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
					onChange={(e) => update({ playerName: e.target.value })}
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
							update({ compactStatus: e.target.checked })
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
							update({ saveOnHide: e.target.checked })
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
							onChange={() => update({ shiftMode: mode })}
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
							update({ nethackrc: e.target.value })
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
							update({ nethackrc: nethackrcContents });
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
