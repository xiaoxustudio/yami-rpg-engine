import { isApiAttached, markApiAttached } from '../../../utils/element-data';
import { attachApi } from '../../../utils/attach-api';

export interface ToastManagerApi extends HTMLElement {
	show(...args: unknown[]): HTMLDivElement;
	dismiss(el: HTMLElement | null): void;
}

export function attachToastManagerApi(el: HTMLElement): ToastManagerApi {
	const manager = el as ToastManagerApi;
	if (isApiAttached(manager)) return manager;

	const timerMap = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

	const show = function (
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
			timerMap.set(
				toast,
				setTimeout(() => manager.dismiss(toast), duration)
			);
		}
		return toast;
	};

	const dismiss = function (toast: HTMLElement | null): void {
		if (!toast || toast.parentNode !== manager) return;
		const timer = timerMap.get(toast);
		if (timer !== undefined) clearTimeout(timer);
		toast.classList.remove('toast-show');
		toast.classList.add('toast-hide');
		setTimeout(() => toast.remove(), 200);
	};

	attachApi<ToastManagerApi>(manager, { show, dismiss });

	markApiAttached(manager);
	return manager;
}

export function createToastManagerElement(): ToastManagerApi {
	const el = document.createElement('div');
	el.className = 'toast-manager';
	return attachToastManagerApi(el);
}
