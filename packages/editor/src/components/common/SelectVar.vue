<template>
	<YMSelectVar
		ref="ym"
		:items="props.items"
		:model-value="props.modelValue"
		:popup="false"
		:id="props.id"
		@update:model-value="onValue"
		@pointerdown="onPointerdown"
		@keydown="onKeydown"
	>
		<template #variable>
			<CustomBox
				ref="varBoxRef"
				type="variable"
				filter="all"
				:model-value="state.varValue ?? defVar"
				@input="onVarValue"
			/>
		</template>
	</YMSelectVar>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { YMSelectVar } from '@ui-kit';
import { defVar } from '@app/components/select-var';
import { Select } from '@app/components/select-list.ts';
import CustomBox from '@app/components/common/CustomBox.vue';
import { attachElementApi } from '@app/utils/attach-element-api';

interface Props {
	id?: string;
	modelValue?: unknown;
	items?: unknown[];
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null,
	items: () => []
});

const emit = defineEmits<{
	'update:modelValue': [value: unknown];
}>();

const state = reactive<{ varValue: unknown }>({
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
	loadItems(items: unknown[]): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);
const varBoxRef = ref<InstanceType<typeof CustomBox> | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const getChildRoot = (
	instance: { $el?: Element | null; root?: HTMLElement | null } | null
): HTMLElement | null => {
	if (!instance) return null;
	if (instance.$el instanceof HTMLElement) return instance.$el;
	if (instance.root instanceof HTMLElement) return instance.root;
	return null;
};

const read = (): unknown => ym.value?.read();

const write = (value: unknown): void => {
	ym.value?.write(value);
	if (typeof value === 'object' && value !== null) {
		state.varValue = value;
	} else {
		state.varValue = null;
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
const loadItems = (items: unknown[]): void => ym.value?.loadItems(items);

const onPointerdown = (event: PointerEvent): void => {
	const el = root.value;
	if (!el) return;
	if (event.button !== 0 || event.target === el) return;
	const selectBox = (ym.value?.root?.querySelector('.select-box') as HTMLElement) ?? null;
	if (selectBox) Select.open(selectBox);
};

const onKeydown = (event: KeyboardEvent): void => {
	if (
		(event.code === 'Enter' || event.code === 'NumpadEnter') &&
		!(event.ctrlKey || event.metaKey)
	) {
		event.stopPropagation();
		const selectBox = (ym.value?.root?.querySelector('.select-box') as HTMLElement) ?? null;
		if (selectBox) Select.open(selectBox);
	}
};

const onValue = (value: unknown): void => {
	emit('update:modelValue', value);
};

const onVarValue = (value: unknown): void => {
	state.varValue = value;
	emit('update:modelValue', value);
};

defineExpose({ read, write, switch: switchMode, enable, disable, getFocus, on, loadItems, root });

const api = {
	selectBox: null as HTMLElement | null,
	varBox: null as HTMLElement | null,
	mode: 'constant',
	read,
	write,
	switch: switchMode,
	enable,
	disable,
	getFocus,
	on,
	loadItems
};

watch(
	() => props.modelValue,
	(val) => write(val)
);

onMounted(() => {
	const el = root.value as HTMLElement & {
		read: () => unknown;
		write: (value: unknown) => void;
		switch: (mode?: string) => void;
		enable: () => void;
		disable: () => void;
		getFocus: (mode?: string) => void;
		on: (
			type: string,
			listener: (event: Event) => void,
			options?: boolean | AddEventListenerOptions
		) => void;
		loadItems: (items: unknown[]) => void;
		selectBox: HTMLElement | null;
		varBox: HTMLElement | null;
		mode: string;
	};
	if (!el) return;
	api.selectBox = (ym.value?.root?.querySelector('.select-box') as HTMLElement) ?? null;
	api.varBox = getChildRoot(varBoxRef.value);
	api.mode = el.classList.contains('variable') ? 'variable' : 'constant';
	attachElementApi(el, api);
	watch(
		() => root.value?.className,
		() => {
			const cls = root.value?.className ?? '';
			api.mode = cls.includes('variable') ? 'variable' : 'constant';
			api.selectBox = (ym.value?.root?.querySelector('.select-box') as HTMLElement) ?? null;
			api.varBox = getChildRoot(varBoxRef.value);
			nextTick(() => {
				emit('update:modelValue', read());
			});
		}
	);
	watch(varBoxRef, (val) => {
		api.varBox = getChildRoot(val);
	});
	if (props.modelValue !== null && props.modelValue !== undefined) {
		write(props.modelValue);
	}
});
</script>
