import { createScrollListener } from '@ui-kit';

const scrollListener = createScrollListener();

export function addScrollListener(
	el: HTMLElement,
	mode: string,
	speed: number,
	shift: boolean,
	updater?: () => void
): void {
	scrollListener.add(el, mode, speed, shift, updater);
}

export function removeScrollListener(el: HTMLElement): void {
	scrollListener.remove(el);
}
