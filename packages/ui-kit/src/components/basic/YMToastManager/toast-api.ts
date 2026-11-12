/**
 * Toast 管理器的命令式工厂（返回 `{ root, api }` 句柄，元素上不挂方法）。
 *
 * Vue 侧用 `YMToastManager.vue`（`defineExpose`）；这里只服务 editor 的全局 `Toast`
 * 单例（不存在组件树），所以分成「根元素」与「能力对象」两份交出去。
 */
export interface ToastManagerApi {
	show(message: string, type?: string, duration?: number): HTMLDivElement;
	dismiss(el: HTMLElement | null): void;
}

export interface ToastManagerHandle {
	root: HTMLDivElement;
	api: ToastManagerApi;
}

export function attachToastManagerApi(el: HTMLElement): ToastManagerApi {
	const root = el;
	const timerMap = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

	const api: ToastManagerApi = {
		show(message: string, type: string = 'info', duration: number = 4000): HTMLDivElement {
			const toast = document.createElement('div');
			toast.className = `toast toast-${type}`;
			const text = document.createElement('span');
			text.className = 'toast-text';
			text.textContent = message;
			const close = document.createElement('span');
			close.className = 'toast-close';
			close.textContent = '×';
			close.addEventListener('click', () => api.dismiss(toast));
			toast.appendChild(text);
			toast.appendChild(close);
			root.appendChild(toast);
			requestAnimationFrame(() => toast.classList.add('toast-show'));
			if (duration > 0) {
				timerMap.set(
					toast,
					setTimeout(() => api.dismiss(toast), duration)
				);
			}
			return toast;
		},
		dismiss(toast: HTMLElement | null): void {
			if (!toast || toast.parentNode !== root) return;
			const timer = timerMap.get(toast);
			if (timer !== undefined) clearTimeout(timer);
			toast.classList.remove('toast-show');
			toast.classList.add('toast-hide');
			setTimeout(() => toast.remove(), 200);
		}
	};

	return api;
}

export function createToastManagerElement(): ToastManagerHandle {
	const root = document.createElement('div');
	root.className = 'toast-manager';
	return { root, api: attachToastManagerApi(root) };
}
