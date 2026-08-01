<template>
	<file-var ref="root" :filter="props.filter" />
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

interface FileVarElement extends HTMLElement {
	mode: string;
	strBox: HTMLElement & { [k: string]: any };
	varBox: any;
	read(): any;
	write(value: any): void;
	switch(mode?: string): void;
	enable(): void;
	disable(): void;
	getFocus(mode: any): any;
}

interface Props {
	filter?: string;
}

const props = defineProps<Props>();

const root = ref<FileVarElement | null>(null);

const read = (): any => (root.value ? readElement(root.value) : undefined);
const write = (value: any): void => { if (root.value) writeElement(root.value, value); };
const switchMode = (mode?: string): void => root.value?.switch(mode);
const enable = (): void => { if (root.value) enableElement(root.value); };
const disable = (): void => { if (root.value) disableElement(root.value); };
const getFocus = (mode: any): any => (root.value ? getFocusElement(root.value, mode) : undefined);

defineExpose({ read, write, switch: switchMode, enable, disable, getFocus, root });
</script>
