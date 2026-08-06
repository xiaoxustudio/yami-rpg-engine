import { createToastManagerElement, type ToastManagerApi } from '@ui-kit';

export function createToastManager(): ToastManagerApi {
	return createToastManagerElement();
}

export const Toast = {
	_manager(): HTMLElement {
		let m = document.querySelector('.toast-manager');
		if (!m) {
			m = createToastManager();
			document.body.appendChild(m);
		}
		return m as HTMLElement;
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
		Toast.error(detail.message || String(detail));
	}
}) as EventListener);
