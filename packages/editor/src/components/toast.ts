import { createToastManagerElement, type ToastManagerApi } from '@ui-kit';

interface ToastManagerHandle {
	root: HTMLElement;
	api: ToastManagerApi;
}

let manager: ToastManagerHandle | null = null;

export const Toast = {
	_manager(): ToastManagerHandle {
		if (!manager) {
			manager = createToastManagerElement() as ToastManagerHandle;
			document.body.appendChild(manager.root);
		}
		return manager;
	},
	show(message: string, type?: string, duration?: number): HTMLDivElement {
		return this._manager().api.show(message, type ?? 'info', duration ?? 4000);
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
