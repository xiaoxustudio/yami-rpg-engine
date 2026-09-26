import { createToastManagerElement, type ToastManagerApi } from '@ui-kit';

export function createToastManager(): ToastManagerApi {
	return createToastManagerElement();
}

// 管理器单例放在模块里（原先用 `document.querySelector('.toast-manager')` 反查自己创建的元素；
// 该 id/类在编辑器的模板里没有渲染者，故模块内持有引用等价且更可靠）
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
