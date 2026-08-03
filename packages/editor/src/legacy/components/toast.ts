import { on } from '@/util/element-utils.ts';

interface ToastManagerElement extends HTMLElement {
	show(message: string, type?: string, duration?: number): HTMLDivElement;
	dismiss(el: HTMLElement | null): void;
}

export function attachToastManagerApi(el: HTMLElement): void {
	const manager = el as ToastManagerElement;

	manager.show = function (
		message: string,
		type: string = 'info',
		duration: number = 4000
	): HTMLDivElement {
		const toast = document.createElement('div');
		toast.className = `toast toast-${type}`;
		const text = document.createElement('span');
		text.className = 'toast-text';
		text.textContent = message;
		const close = document.createElement('span');
		close.className = 'toast-close';
		close.textContent = '×';
		on(close, 'click', () => manager.dismiss(toast));
		toast.appendChild(text);
		toast.appendChild(close);
		manager.appendChild(toast);
		requestAnimationFrame(() => toast.classList.add('toast-show'));
		if (duration > 0) {
			(toast as HTMLDivElement & { _timer: ReturnType<typeof setTimeout> })._timer =
				setTimeout(() => manager.dismiss(toast), duration);
		}
		return toast;
	};

	manager.dismiss = function (toast: HTMLElement | null): void {
		if (!toast || toast.parentNode !== manager) return;
		clearTimeout((toast as HTMLElement & { _timer: ReturnType<typeof setTimeout> })._timer);
		toast.classList.remove('toast-show');
		toast.classList.add('toast-hide');
		setTimeout(() => toast.remove(), 200);
	};
}

export function createToastManager(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'toast-manager';
	attachToastManagerApi(el);
	return el;
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
		return (this._manager() as ToastManagerElement).show(
			message,
			type ?? 'info',
			duration ?? 4000
		);
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
