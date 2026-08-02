<template>
	<div class="number-var" ref="root" :id="props.id">
		<NumberBox
			v-if="state.mode === 'constant'"
			ref="numBoxRef"
			@update:model-value="(v: any) => (state.numValue = v)"
		/>
		<CustomBox
			v-else-if="state.mode === 'variable'"
			ref="varBoxRef"
			type="variable"
			filter="number"
			:model-value="state.varValue ?? defVar"
			@update:model-value="(v: any) => (state.varValue = v)"
		/>
	</div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, watch } from 'vue';
import {
	addClass,
	removeClass,
	hasClass,
	getFocus as getFocusElement,
	dispatchChangeEvent,
	enable as enableElement,
	disable as disableElement
} from '@/util/element-utils';
import { defVar, defVarForPlugin } from '@/components/number-var';
import NumberBox from '@app/components/common/NumberBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

interface Props {
	id?: string;
}

interface NumberVarElement extends HTMLElement {
	mode: string;
	numBox: HTMLElement | null;
	varBox: HTMLElement | null;
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

const props = defineProps<Props>();

const root = ref<NumberVarElement | null>(null);
const numBoxRef = ref<any>(null);
const varBoxRef = ref<any>(null);

const state = reactive({
	mode: null as string | null,
	numValue: 0,
	varValue: null as any,
	pluginInput: false
});

const getChildRoot = (instance: any): HTMLElement | null => {
	if (!instance) return null;
	if (instance.$el instanceof HTMLElement) return instance.$el;
	if (instance.root instanceof HTMLElement) return instance.root;
	return null;
};

const getVarPluginInput = (): boolean => {
	const varBox = getChildRoot(varBoxRef.value);
	if (varBox) return !!(varBox as any).isPluginInput;
	return state.pluginInput;
};

const read = (): any => {
	switch (state.mode) {
		case 'constant':
			return numBoxRef.value ? numBoxRef.value.read() : state.numValue;
		case 'variable':
			return varBoxRef.value ? varBoxRef.value.read() : state.varValue;
	}
};

const write = (value: any): void => {
	switch (typeof value) {
		case 'number': {
			const plugin = getVarPluginInput();
			switchMode('constant');
			state.numValue = value;
			numBoxRef.value?.write(value);
			state.varValue = plugin ? defVarForPlugin : defVar;
			break;
		}
		case 'object':
			switchMode('variable');
			state.numValue = 0;
			numBoxRef.value?.write(0);
			state.varValue = value;
			break;
	}
};

const switchMode = (target?: string): void => {
	const el = root.value;
	const focus = !target && !!el && !hasClass(el, 'disabled');
	if (target === undefined) {
		switch (state.mode) {
			case 'constant':
				target = 'variable';
				break;
			case 'variable':
				target = 'constant';
				break;
		}
	}
	if (state.mode !== target) {
		if (el) {
			removeClass(el, state.mode as string);
			addClass(el, target as string);
			el.mode = target as string;
		}
		state.mode = target as string;
		if (target === 'constant') {
			nextTick(() => {
				const input = numBoxRef.value?.input;
				if (focus && input) {
					input.focus();
					input.select();
				}
			});
		} else if (target === 'variable') {
			nextTick(() => {
				if (focus) varBoxRef.value?.focus();
			});
		}
		if (el) dispatchChangeEvent(el);
	}
};

const enable = (): void => {
	if (removeClass(root.value, 'disabled')) {
		enableElement(getChildRoot(numBoxRef.value));
		enableElement(getChildRoot(varBoxRef.value));
	}
};

const disable = (): void => {
	if (addClass(root.value, 'disabled')) {
		disableElement(getChildRoot(numBoxRef.value));
		disableElement(getChildRoot(varBoxRef.value));
	}
};

const getFocus = (mode: any): any => {
	switch (state.mode) {
		case 'constant':
			return getFocusElement(getChildRoot(numBoxRef.value), mode);
		case 'variable':
			return getFocusElement(getChildRoot(varBoxRef.value), mode);
	}
};

const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	const el = root.value;
	if (!el) return;
	el.addEventListener(type, listener as EventListener, options);
};

const keydown = (event: any): void => {
	switch (event.code) {
		case 'Slash':
			event.preventDefault();
			switchMode();
			break;
	}
};

const pointerdown = (event: any): void => {
	const el = root.value;
	switch (event.button) {
		case 0:
			if (el && !hasClass(el, 'disabled') && event.target === el) {
				event.preventDefault();
				switchMode();
			}
			break;
		case 2:
			if (el && !hasClass(el, 'disabled')) {
				event.preventDefault();
				switchMode();
			}
			break;
	}
};

defineExpose({ read, write, switch: switchMode, enable, disable, getFocus, on, root });

watch(numBoxRef, (val) => {
	const el = root.value;
	if (el) {
		el.numBox = getChildRoot(val);
		if (val) {
			nextTick(() => {
				val.write?.(state.numValue);
			});
		}
	}
});

watch(varBoxRef, (val) => {
	const el = root.value;
	if (el) {
		el.varBox = getChildRoot(val);
		if (el.varBox) state.pluginInput = !!(el.varBox as any).isPluginInput;
	}
});

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.read = read;
	el.write = write;
	el.switch = switchMode;
	el.enable = enable;
	el.disable = disable;
	el.getFocus = getFocus;
	el.on = on;
	el.mode = state.mode;
	el.addEventListener('keydown', keydown as EventListener);
	el.addEventListener('pointerdown', pointerdown as EventListener);
});
</script>
