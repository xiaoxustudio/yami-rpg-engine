import { Data } from '@app/data/data-object.ts';
import type { VariableNodeShape } from '@app/stores/data';

export function getVariable(id: string | number | null | undefined): VariableNodeShape | undefined {
	if (id == null) return undefined;
	return Data.variables?.map[id];
}

export function reportError(err: unknown, context?: string): void {
	const message = `[Yami] ${context ?? '运行时错误'}: ${(err as Error)?.message ?? err}`;
	console.error(message, err);
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new CustomEvent('yami:error', { detail: { message, error: err } }));
	}
}

export function debounce<T extends (...args: any[]) => void>(
	fn: T,
	delay = 150
): T & { cancel(): void } {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const debounced = function (this: unknown, ...args: unknown[]) {
		if (timer !== undefined) clearTimeout(timer);
		timer = setTimeout(() => {
			timer = undefined;
			fn.apply(this, args);
		}, delay);
	} as T & { cancel(): void };
	debounced.cancel = function () {
		if (timer !== undefined) {
			clearTimeout(timer);
			timer = undefined;
		}
	};
	return debounced;
}

export function rafThrottle<T extends (...args: any[]) => void>(fn: T): T & { cancel(): void } {
	let handle: number | undefined;
	let lastArgs: unknown[];
	const throttled = function (this: unknown, ...args: unknown[]) {
		lastArgs = args;
		if (handle === undefined) {
			handle = requestAnimationFrame(() => {
				handle = undefined;
				fn.apply(this, lastArgs);
			});
		}
	} as T & { cancel(): void };
	throttled.cancel = function () {
		if (handle !== undefined) {
			cancelAnimationFrame(handle);
			handle = undefined;
		}
	};
	return throttled;
}
