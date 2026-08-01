<template>
	<select-var ref="root" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  read as readElement,
  write as writeElement,
  enable as enableElement,
  disable as disableElement,
  getFocus as getFocusElement,
  clear as clearElement
} from '@/util/element-utils';

interface SelectVarElement extends HTMLElement {
	mode: string;
	selectBox: HTMLElement & { [k: string]: any };
	varBox: any;
	read(): any;
	write(value: any): void;
	switch(mode?: string): void;
	enable(): void;
	disable(): void;
	loadItems(items: any): void;
	getFocus(mode: any): any;
	clear(): void;
}

const root = ref<SelectVarElement | null>(null);

const read = (): any => (root.value ? readElement(root.value) : undefined);
const write = (value: any): void => { if (root.value) writeElement(root.value, value); };
const switchMode = (mode?: string): void => root.value?.switch(mode);
const enable = (): void => { if (root.value) enableElement(root.value); };
const disable = (): void => { if (root.value) disableElement(root.value); };
const loadItems = (items: any): void => root.value?.loadItems(items);
const getFocus = (mode: any): any => (root.value ? getFocusElement(root.value, mode) : undefined);
const clear = (): void => { if (root.value) clearElement(root.value); };

defineExpose({ read, write, switch: switchMode, enable, disable, loadItems, getFocus, clear, root });
</script>
