<template>
	<YMFileVar ref="ym" :model-value="props.modelValue" :id="props.id" :disabled="props.disabled">
		<template #file>
			<CustomBox
				ref="fileBoxRef"
				type="file"
				:filter="props.filter"
				:model-value="state.fileValue"
				@update:model-value="(v: string) => (state.fileValue = v)"
			/>
		</template>
		<template #variable>
			<CustomBox
				ref="varBoxRef"
				type="variable"
				filter="string"
				:model-value="state.varValue ?? defVar"
				@update:model-value="(v: unknown) => (state.varValue = v)"
			/>
		</template>
	</YMFileVar>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { YMFileVar } from '@ui-kit';
import { defVar } from '@/components/file-var';
import CustomBox from '@app/components/common/CustomBox.vue';
import { attachElementApi } from '@/utils/attach-element-api';

interface Props {
	id?: string;
	filter?: string;
	disabled?: boolean;
	modelValue?: unknown;
}

const props = withDefaults(defineProps<Props>(), {
	filter: '',
	disabled: false,
	modelValue: null
});

const emit = defineEmits<{
	'update:modelValue': [value: unknown];
}>();

const state = reactive<{ fileValue: string; varValue: unknown }>({
	fileValue: '',
	varValue: null
});

const ym = ref<{
	root: HTMLElement | null;
	read(): unknown;
	write(value: unknown): void;
	switch(mode?: string): void;
	enable(): void;
	disable(): void;
	getFocus(mode?: string): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);
const fileBoxRef = ref<InstanceType<typeof CustomBox> | null>(null);
const varBoxRef = ref<InstanceType<typeof CustomBox> | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const getChildRoot = (instance: { $el?: unknown; root?: unknown } | null): HTMLElement | null => {
	if (!instance) return null;
	if (instance.$el instanceof HTMLElement) return instance.$el;
	if (instance.root instanceof HTMLElement) return instance.root;
	return null;
};

const read = (): unknown => {
	const isVariable = (root.value?.className ?? '').includes('variable');
	return isVariable ? (state.varValue ?? null) : state.fileValue;
};

const write = (value: unknown): void => {
	ym.value?.write(value);
	if (typeof value === 'string') {
		state.fileValue = value;
		state.varValue = defVar;
	} else if (typeof value === 'object' && value !== null) {
		state.fileValue = '';
		state.varValue = value;
	}
};

const switchMode = (target?: string): void => ym.value?.switch(target);
const enable = (): void => ym.value?.enable();
const disable = (): void => ym.value?.disable();
const getFocus = (mode?: string): void => ym.value?.getFocus(mode);
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ read, write, switch: switchMode, enable, disable, getFocus, on, root });

watch(
	() => props.modelValue,
	(val) => write(val)
);

onMounted(() => {
	const el = root.value as HTMLElement & {
		read(): unknown;
		write(value: unknown): void;
		switch(mode?: string): void;
		enable(): void;
		disable(): void;
		getFocus(mode?: string): void;
		on(
			type: string,
			listener: (event: Event) => void,
			options?: boolean | AddEventListenerOptions
		): void;
		mode: string;
		fileBox: HTMLElement | null;
		varBox: HTMLElement | null;
	};
	if (!el) return;
	el.mode = el.classList.contains('variable') ? 'variable' : 'constant';
	el.fileBox = getChildRoot(fileBoxRef.value);
	el.varBox = getChildRoot(varBoxRef.value);
	attachElementApi(el, { read, write, switch: switchMode, enable, disable, getFocus, on });
	watch(
		() => root.value?.className,
		() => {
			const cls = root.value?.className ?? '';
			el.mode = cls.includes('variable') ? 'variable' : 'constant';
			el.fileBox = getChildRoot(fileBoxRef.value);
			el.varBox = getChildRoot(varBoxRef.value);
			nextTick(() => {
				emit('update:modelValue', read());
			});
		},
		{ immediate: true }
	);
	watch(fileBoxRef, (val) => {
		el.fileBox = getChildRoot(val);
	});
	watch(varBoxRef, (val) => {
		el.varBox = getChildRoot(val);
	});
	if (props.modelValue !== null && props.modelValue !== undefined) {
		write(props.modelValue);
	}
});
</script>
