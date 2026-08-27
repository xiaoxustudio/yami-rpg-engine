type WindowKeydownHandler = (event: KeyboardEvent) => void;

const keydowns = new Map<string, WindowKeydownHandler>();

export function registerWindowKeydown(name: string, handler: WindowKeydownHandler): void {
	keydowns.set(name, handler);
}

export function getWindowKeydowns(): WindowKeydownHandler[] {
	return [...keydowns.values()];
}
