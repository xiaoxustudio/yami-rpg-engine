let resolveLazyReady: (() => void) | undefined;

export const lazyComponentsReady: Promise<void> = new Promise((resolve) => {
	resolveLazyReady = resolve;
});

export function resolveLazyComponentsReady(): void {
	resolveLazyReady?.();
}
