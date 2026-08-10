import { isInContent } from './element-utils.ts';

let last: PointerEvent | null = null;

const pointerdown = function (
	this: { isInContent(event: PointerEvent): boolean },
	event: PointerEvent & {
		cmdOrCtrlKey?: boolean;
		doubleclickProcessed?: boolean;
	}
) {
	if (
		!(event.ctrlKey || event.metaKey) &&
		!event.altKey &&
		!event.shiftKey &&
		!event.doubleclickProcessed
	) {
		event.doubleclickProcessed = true;
		switch (event.button) {
			case 0:
				if (
					last !== null &&
					event.target === last.target &&
					event.timeStamp - last.timeStamp < 500 &&
					Math.abs(event.clientX - last.clientX) < 4 &&
					Math.abs(event.clientY - last.clientY) < 4 &&
					isInContent(this, event)
				) {
					if (!event.target!.dispatchEvent(new PointerEvent('doubleclick', event))) {
						event.preventDefault();
					}
					last = null;
				} else {
					last = event;
				}
				break;
			default:
				last = null;
				break;
		}
	}
};

export const attachDoubleclick = function (
	element: EventTarget,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
) {
	element.addEventListener('pointerdown', pointerdown as unknown as EventListener);
	element.addEventListener('doubleclick', listener, options);
};

export const detachDoubleclick = function (
	element: EventTarget,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
) {
	element.removeEventListener('pointerdown', pointerdown as unknown as EventListener, options);
	element.removeEventListener('doubleclick', listener, options);
};
