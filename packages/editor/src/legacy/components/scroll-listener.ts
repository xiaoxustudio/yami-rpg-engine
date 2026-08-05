import { createScrollListener } from '@ui-kit';

const listener = createScrollListener();

(
	HTMLElement.prototype as HTMLElement & {
		addScrollListener: (
			mode: string,
			speed: number,
			shift: boolean,
			updater?: () => void
		) => void;
		removeScrollListener: () => void;
	}
).addScrollListener = function (
	mode: string,
	speed: number,
	shift: boolean,
	updater?: () => void
): void {
	listener.add(this as HTMLElement, mode, speed, shift, updater);
};

(
	HTMLElement.prototype as HTMLElement & {
		removeScrollListener: () => void;
	}
).removeScrollListener = function (): void {
	listener.remove(this as HTMLElement);
};
