import { markBoot } from '@app/utils/boot-timeline';

let resolveCriticalReady: (() => void) | undefined;
let resolveLazyReady: (() => void) | undefined;

export const criticalComponentsReady: Promise<void> = new Promise((resolve) => {
	resolveCriticalReady = resolve;
});

export const lazyComponentsReady: Promise<void> = new Promise((resolve) => {
	resolveLazyReady = resolve;
});

export function resolveCriticalComponentsReady(): void {
	resolveCriticalReady?.();
	resolveCriticalReady = undefined;
	markBoot('critical-ready');
}

export function resolveLazyComponentsReady(): void {
	resolveLazyReady?.();
	resolveLazyReady = undefined;
	markBoot('lazy-ready');
}
