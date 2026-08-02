<template>
	<div class="select-var" ref="root" :id="props.id">
		<SelectBox v-show="mode === 'constant'" ref="selectBoxRef" />
		<CustomBox v-show="mode === 'variable'" ref="varBoxRef" type="variable" filter="all" />
	</div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import {
	addClass,
	removeClass,
	hasClass,
	getFocus as getFocusElement,
	enable as enableElement,
	disable as disableElement,
	read as readElement,
	write as writeElement
} from '@/util/element-utils';
import SelectBox from './SelectBox.vue';
import CustomBox from './CustomBox.vue';

interface SelectVarElement extends HTMLElement {
	mode: string | null;
	selectBox: HTMLElement & { [k: string]: any } | null;
	varBox: HTMLElement & { [k: string]: any } | null;
	read(): any;
	write(value: any): void;
	switch(mode?: string): void;
	enable(): void;
	disable(): void;
	getFocus(mode: any): any;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), {});

const root = ref<SelectVarElement | null>(null);
const selectBoxRef = ref<InstanceType<typeof SelectBox> | null>(null);
const varBoxRef = ref<InstanceType<typeof CustomBox> | null>(null);

const mode = ref<string | null>(null);

const selectBoxEl = (): HTMLElement & { [k: string]: any } | null =>
	(selectBoxRef.value?.root as any) ?? null;
const varBoxEl = (): HTMLElement & { [k: string]: any } | null =>
	(varBoxRef.value?.root as any) ?? null;

const read = (): any => {
	switch (mode.value) {
		case 'constant': {
			const selectBox = selectBoxEl();
			return selectBox ? readElement(selectBox) : undefined;
		}
		case 'variable': {
			const varBox = varBoxEl();
			return varBox ? readElement(varBox) : undefined;
		}
	}
};

const write = (value: any): void => {
	switch (typeof value) {
		case 'string':
			switchMode('constant');
			nextTick(() => {
				const selectBox = selectBoxEl();
				if (selectBox) writeElement(selectBox, value);
			});
			break;
		case 'object':
			switchMode('variable');
			nextTick(() => {
				const varBox = varBoxEl();
				if (varBox) writeElement(varBox, value);
			});
			break;
	}
};

const switchMode = (nextMode?: string): void => {
	const el = root.value;
	const focus = !nextMode && !!el && !hasClass(el, 'disabled');
	let target = nextMode;
	if (target === undefined) {
		switch (mode.value) {
			case 'constant':
				target = 'variable';
				break;
			case 'variable':
				target = 'constant';
				break;
		}
	}
	if (mode.value !== target) {
		if (el) {
			removeClass(el, mode.value as string);
			addClass(el, target as string);
		}
		mode.value = target as string;
		if (focus) {
			nextTick(() => {
				if (target === 'constant') {
					selectBoxEl()?.focus();
				} else if (target === 'variable') {
					varBoxEl()?.focus();
				}
			});
		}
	}
};

const enable = (): void => {
	const el = root.value;
	if (el && removeClass(el, 'disabled')) {
		enableElement(selectBoxEl());
		enableElement(varBoxEl());
	}
};

const disable = (): void => {
	const el = root.value;
	if (el && addClass(el, 'disabled')) {
		disableElement(selectBoxEl());
		disableElement(varBoxEl());
	}
};

const getFocus = (focusMode: any): void => {
	switch (mode.value) {
		case 'constant':
			if (selectBoxEl()) getFocusElement(selectBoxEl(), focusMode);
			break;
		case 'variable':
			if (varBoxEl()) getFocusElement(varBoxEl(), focusMode);
			break;
	}
};

const loadItems = (items: any): void => {
	selectBoxEl()?.loadItems?.(items);
};

const clear = (): void => {
	selectBoxEl()?.clear?.();
};

const keydown = (event: KeyboardEvent): void => {
	switch (event.code) {
		case 'Slash':
			event.preventDefault();
			switchMode();
			break;
	}
};

const pointerdown = (event: PointerEvent): void => {
	const el = root.value;
	if (!el) return;
	switch (event.button) {
		case 0:
			if (!hasClass(el, 'disabled') && event.target === el) {
				event.preventDefault();
				switchMode();
			}
			break;
		case 2:
			if (!hasClass(el, 'disabled')) {
				event.preventDefault();
				switchMode();
			}
			break;
	}
};

const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.addEventListener(type, listener as EventListener, options);
};

defineExpose({
	read,
	write,
	switch: switchMode,
	enable,
	disable,
	getFocus,
	loadItems,
	clear,
	on,
	root
});

watch(mode, () => {
	const el = root.value;
	if (!el) return;
	el.mode = mode.value;
	nextTick(() => {
		el.selectBox = selectBoxEl();
		el.varBox = varBoxEl();
	});
});

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.mode = mode.value;
	el.selectBox = selectBoxEl();
	el.varBox = varBoxEl();
	el.read = read;
	el.write = write;
	el.switch = switchMode;
	el.enable = enable;
	el.disable = disable;
	el.getFocus = getFocus;
	el.loadItems = loadItems;
	el.clear = clear;
	el.on = on;
	el.addEventListener('keydown', keydown as EventListener);
	el.addEventListener('pointerdown', pointerdown as EventListener);
});
</script>
