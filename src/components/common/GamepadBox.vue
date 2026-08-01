<template>
	<gamepad-box ref="root" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  read as readElement,
  write as writeElement,
  enable as enableElement,
  disable as disableElement,
  getFocus as getFocusElement
} from '@/util/element-utils';

interface GamepadBoxElement extends HTMLElement {
	read(): number | null;
	write(button: number): void;
	enable(): void;
	disable(): void;
	getFocus(mode: any): any;
}

const root = ref<GamepadBoxElement | null>(null);

const read = (): number | null => (root.value ? readElement(root.value) : undefined) ?? null;
const write = (button: number): void => { if (root.value) writeElement(root.value, button); };
const enable = (): void => { if (root.value) enableElement(root.value); };
const disable = (): void => { if (root.value) disableElement(root.value); };
const getFocus = (mode: any): any => (root.value ? getFocusElement(root.value, mode) : undefined);

defineExpose({ read, write, enable, disable, getFocus, root });
</script>
