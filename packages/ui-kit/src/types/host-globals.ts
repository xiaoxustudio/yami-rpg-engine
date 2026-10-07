declare global {
	interface Window {
		Window?: { close(id?: string): void };
	}
}

export {};
