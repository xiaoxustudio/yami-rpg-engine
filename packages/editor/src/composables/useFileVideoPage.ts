export function useFileVideoPage() {
	const windowError = (event: Event): void => {
		if ((event as ErrorEvent).message === 'ResizeObserver loop limit exceeded') {
			event.stopImmediatePropagation();
		}
	};

	return { windowError };
}
