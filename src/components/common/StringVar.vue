<template>
	<div class="string-var" ref="root" :id="props.id">
		<TextBox
			v-if="state.mode === 'constant'"
			ref="strBoxRef"
			@update:model-value="(v: any) => (state.strValue = v)"
		/>
		<CustomBox
			v-else-if="state.mode === 'variable'"
			ref="varBoxRef"
			type="variable"
			filter="string"
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
	enable as enableElement,
	disable as disableElement
} from '@/util/element-utils';
import { defVar } from '@/components/string-var';
import TextBox from '@app/components/common/TextBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

interface Props {
	id?: string;
}

interface StringVarElement extends HTMLElement {
	mode: string;
	strBox: HTMLElement | null;
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

const root = ref<StringVarElement | null>(null);
const strBoxRef = ref<any>(null);
const varBoxRef = ref<any>(null);

const state = reactive({
	mode: null as string | null,
	strValue: '',
	varValue: null as any
});

const getChildRoot = (instance: any): HTMLElement | null => {
	if (!instance) return null;
	if (instance.$el instanceof HTMLElement) return instance.$el;
	if (instance.root instanceof HTMLElement) return instance.root;
	return null;
};

const read = (): any => {
	switch (state.mode) {
		case 'constant':
			return strBoxRef.value ? strBoxRef.value.read() : state.strValue;
		case 'variable':
			return varBoxRef.value ? varBoxRef.value.read() : state.varValue;
	}
};

const write = (value: any): void => {
	switch (typeof value) {
		case 'string':
			switchMode('constant');
			state.strValue = value;
			strBoxRef.value?.write(value);
			break;
		case 'object':
			switchMode('variable');
			state.strValue = '';
			strBoxRef.value?.write('');
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
				const input = strBoxRef.value?.input;
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
	}
};

const enable = (): void => {
	if (removeClass(root.value, 'disabled')) {
		enableElement(getChildRoot(strBoxRef.value));
		enableElement(getChildRoot(varBoxRef.value));
	}
};

const disable = (): void => {
	if (addClass(root.value, 'disabled')) {
		disableElement(getChildRoot(strBoxRef.value));
		disableElement(getChildRoot(varBoxRef.value));
	}
};

const getFocus = (mode: any): any => {
	switch (state.mode) {
		case 'constant':
			return getFocusElement(getChildRoot(strBoxRef.value), mode);
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

watch(strBoxRef, (val) => {
	const el = root.value;
	if (el) {
		el.strBox = getChildRoot(val);
		if (val) {
			nextTick(() => {
				val.write?.(state.strValue);
			});
		}
	}
});

watch(varBoxRef, (val) => {
	const el = root.value;
	if (el) el.varBox = getChildRoot(val);
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
