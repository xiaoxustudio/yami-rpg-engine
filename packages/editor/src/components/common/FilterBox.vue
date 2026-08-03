<template>
	<div class="filter-box" ref="root" :id="props.id"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const root = ref<HTMLElement | null>(null);

let canvas: HTMLCanvasElement | null = null;
let dataValue: [number, number, number, number] | null = null;

const read = (): [number, number, number, number] | null => dataValue;

const write = (tint: [number, number, number, number]): void => {
	dataValue = tint;
	update();
};

const update = (): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	let cv = canvas;
	if (!cv) {
		cv = document.createElement('canvas');
		cv.width = parseInt(element.getAttribute('width') || '0');
		cv.height = parseInt(element.getAttribute('height') || '0');
		const ctx = cv.getContext('2d') as CanvasRenderingContext2D & {
			gradient?: CanvasGradient;
		};
		(
			cv as HTMLCanvasElement & {
				context: CanvasRenderingContext2D & {
					gradient?: CanvasGradient;
				};
			}
		).context = ctx;
		element.appendChild((canvas = cv));
	}

	const { context, width, height } = cv as HTMLCanvasElement & {
		context: CanvasRenderingContext2D & {
			gradient?: CanvasGradient;
		};
	};
	const [red, green, blue, gray] = dataValue as number[];
	if (!context.gradient) {
		const gradient = context.createLinearGradient(0, 0, 0, height);
		gradient.addColorStop(0, '#ff0000');
		gradient.addColorStop(1 / 6, '#ffff00');
		gradient.addColorStop(2 / 6, '#00ff00');
		gradient.addColorStop(3 / 6, '#00ffff');
		gradient.addColorStop(4 / 6, '#0000ff');
		gradient.addColorStop(5 / 6, '#ff00ff');
		gradient.addColorStop(1, '#ff0000');
		context.gradient = gradient;
	}
	context.globalCompositeOperation = 'source-over';
	context.fillStyle = context.gradient;
	context.fillRect(0, 0, width, height);

	const leftGradient = context.createLinearGradient(0, 0, width >> 1, 0);
	leftGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
	leftGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
	context.fillStyle = leftGradient;
	context.fillRect(0, 0, width >> 1, height);
	const rightGradient = context.createLinearGradient(width >> 1, 0, width, 0);
	rightGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
	rightGradient.addColorStop(1, 'rgba(255, 255, 255, 1)');
	context.fillStyle = rightGradient;
	context.fillRect(width >> 1, 0, width - (width >> 1), height);

	if (gray) {
		context.globalCompositeOperation = 'saturation';
		context.globalAlpha = gray / 255;
		context.fillStyle = '#ffffff';
		context.fillRect(0, 0, width, height);
		context.globalAlpha = 1;
	}

	const addR = Math.max(red, 0);
	const addG = Math.max(green, 0);
	const addB = Math.max(blue, 0);
	if (addR || addG || addB) {
		context.globalCompositeOperation = 'lighter';
		context.fillStyle = `rgba(${addR}, ${addG}, ${addB}, 1)`;
		context.fillRect(0, 0, width, height);
	}

	const subR = Math.max(-red, 0);
	const subG = Math.max(-green, 0);
	const subB = Math.max(-blue, 0);
	if (subR || subG || subB) {
		context.globalCompositeOperation = 'difference';
		context.fillStyle = '#ffffff';
		context.fillRect(0, 0, width, height);
		context.globalCompositeOperation = 'lighter';
		context.fillStyle = `rgba(${subR}, ${subG}, ${subB}, 1)`;
		context.fillRect(0, 0, width, height);
		context.globalCompositeOperation = 'difference';
		context.fillStyle = '#ffffff';
		context.fillRect(0, 0, width, height);
	}
};

const clear = (): void => {
	if (canvas && root.value) {
		root.value.removeChild(canvas);
		canvas = null;
	}
};

onMounted(() => {
	const el = root.value as any;
	if (!el) {
		return;
	}
	el.read = read;
	el.write = write;
	el.update = update;
	el.clear = clear;
});

defineExpose({ read, write, update, clear, root });
</script>
