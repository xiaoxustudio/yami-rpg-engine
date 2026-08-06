export interface ToastManagerApi extends HTMLElement {
	_initialized: boolean;
	show(message: string, type?: string, duration?: number): HTMLDivElement;
	dismiss(el: HTMLElement | null): void;
}

export function attachToastManagerApi(el: HTMLElement): ToastManagerApi {
	const manager = el as ToastManagerApi;
	if (manager._initialized) return manager;

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
		close.addEventListener('click', () => manager.dismiss(toast));
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

	manager._initialized = true;
	return manager;
}

export function createToastManagerElement(): ToastManagerApi {
	const el = document.createElement('div');
	el.className = 'toast-manager';
	return attachToastManagerApi(el);
}
