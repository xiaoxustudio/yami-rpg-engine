import { inject, provide, type InjectionKey } from 'vue';
import { Toast } from '@app/legacy/components/toast';

export interface ToastService {
	show(message: string, type?: string, duration?: number): HTMLDivElement;
	dismiss(el: HTMLElement | null): void;
}

export const TOAST_SERVICE_KEY: InjectionKey<ToastService> = Symbol('toast-service');

export function provideToastService(service: ToastService): void {
	provide(TOAST_SERVICE_KEY, service);
}

export function useToastService(): ToastService {
	return inject(TOAST_SERVICE_KEY, {
		show: (message, type, duration) => Toast.show(message, type, duration),
		dismiss: () => undefined
	});
}
