import { ReactNode, useEffect } from "react";

export const Modal = ({
	title,
	onClose,
	children,
}: {
	title: string;
	onClose: () => void;
	children: ReactNode;
}) => {
	useEffect(() => {
		history.pushState(null, "");
		const onPopState = () => onClose();
		// Capture-phase Escape so NetHack's window listeners don't
		// intercept the close key while the modal is open.
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.stopPropagation();
				onClose();
			}
		};
		window.addEventListener("popstate", onPopState);
		window.addEventListener("keydown", onKeyDown, { capture: true });
		return () => {
			window.removeEventListener("popstate", onPopState);
			window.removeEventListener("keydown", onKeyDown, { capture: true });
		};
	}, [onClose]);

	return (
		<div className="modal-backdrop" onClick={onClose}>
		<div
			className="modal"
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
			role="dialog"
			aria-label={title}
		>
				<div className="modal-header">
					<h2>{title}</h2>
					<button
						className="modal-close"
						onClick={onClose}
						aria-label="Close"
					>
						×
					</button>
				</div>
				<div className="modal-body">{children}</div>
			</div>
		</div>
	);
};
