<template>
	<AppShell />
</template>

<script setup lang="ts">
import AppShell from './AppShell.vue';
import { css } from '@app/utils/element-utils';
import { createScrollListener } from '@ui-kit';
import { Toast } from '@app/components/toast';
import { provideToastService } from '@app/composables/useToastService';

Object.defineProperty(HTMLElement.prototype, 'name', {
	get: function (this: HTMLElement): string | null {
		return this.getAttribute('name');
	},
	set: function (this: HTMLElement, value: string): void {
		this.setAttribute('name', value);
	}
});

Object.defineProperty(HTMLElement.prototype, 'innerHeight', {
	get: function (this: HTMLElement): number {
		let padding = this._paddingTop;
		if (padding === undefined) {
			const style = css(this);
			const pt = parseInt(style.paddingTop);
			const pb = parseInt(style.paddingBottom);
			padding = this._paddingTop = pt + pb;
		}
		const outerHeight = this.clientHeight;
		const innerHeight = outerHeight - padding;
		return Math.max(innerHeight, 0);
	}
});

const scrollListener = createScrollListener();

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
	scrollListener.add(this as HTMLElement, mode, speed, shift, updater);
};

(
	HTMLElement.prototype as HTMLElement & {
		removeScrollListener: () => void;
	}
).removeScrollListener = function (): void {
	scrollListener.remove(this as HTMLElement);
};

provideToastService({
	show: (message, type, duration) => Toast.show(message, type, duration),
	dismiss: () => undefined
});
</script>
