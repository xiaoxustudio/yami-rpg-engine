import { shallowRef, onMounted, onUnmounted, type Ref } from 'vue';
import { on as onEvent, off as offEvent } from '@app/utils/dom';

export function useElement<T extends HTMLElement = HTMLElement>(): Ref<T | null> {
	return shallowRef<T | null>(null);
}

export function useEventListener(
	target: Ref<EventTarget | null> | EventTarget,
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
) {
	const el = 'value' in target ? target : { value: target };
	onMounted(() => {
		if (el.value) {
			onEvent(el.value, type, listener, options);
		}
	});
	onUnmounted(() => {
		if (el.value) {
			offEvent(el.value, type, listener, options);
		}
	});
}

export function useResizeObserver(
	target: Ref<HTMLElement | null>,
	callback: (entry: ResizeObserverEntry) => void
) {
	let observer: ResizeObserver | null = null;
	onMounted(() => {
		if (target.value) {
			observer = new ResizeObserver((entries) => {
				for (const entry of entries) {
					callback(entry);
				}
			});
			observer.observe(target.value);
		}
	});
	onUnmounted(() => {
		if (observer) {
			observer.disconnect();
			observer = null;
		}
	});
}
