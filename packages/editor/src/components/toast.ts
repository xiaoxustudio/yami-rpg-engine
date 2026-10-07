import { createToastManagerElement, type ToastManagerApi } from '@ui-kit';

export function createToastManager(): ToastManagerApi {
	return createToastManagerElement();
}

let manager: HTMLElement | null = null;

export const Toast = {
	_manager(): HTMLElement {
		if (!manager) {
			manager = createToastManager() as HTMLElement;
			document.body.appendChild(manager);
		}
		return manager;
	},
	show(message: string, type?: string, duration?: number): HTMLDivElement {
		return (this._manager() as ToastManagerApi).show(message, type ?? 'info', duration ?? 4000);
	},
	error(message: string): HTMLDivElement {
		return this.show(message, 'error');
	},
	info(message: string): HTMLDivElement {
		return this.show(message, 'info');
	},
	success(message: string): HTMLDivElement {
		return this.show(message, 'success');
	}
};

window.addEventListener('yami:error', ((
	event: Event & { detail: { message?: string } | string }
) => {
	const detail = event.detail;
	if (typeof detail === 'string') {
		Toast.error(detail);
	} else {
		// oxlint-disable-next-line no-base-to-string
		Toast.error(detail.message || String(detail));
	}
}) as EventListener);
