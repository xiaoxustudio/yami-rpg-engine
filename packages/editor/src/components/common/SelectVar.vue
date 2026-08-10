<template>
	<YMSelectVar ref="ym" :items="props.items" :model-value="props.modelValue" :popup="false" :id="props.id">
		<template #variable>
			<CustomBox
				ref="varBoxRef"
				type="variable"
				filter="all"
				:model-value="state.varValue ?? defVar"
				@update:model-value="(v: any) => (state.varValue = v)"
			/>
		</template>
	</YMSelectVar>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { YMSelectVar } from '@ui-kit';
import { defVar } from '@/components/select-var';
import { Select } from '@/components/select-list.ts';
import CustomBox from '@app/components/common/CustomBox.vue';

interface Props {
	id?: string;
	modelValue?: any;
	items?: any[];
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null,
	items: () => []
});

const emit = defineEmits<{
	'update:modelValue': [value: any];
}>();

const state = reactive<{ varValue: any }>({
	varValue: null
});

const ym = ref<{
	root: HTMLElement | null;
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
} | null>(null);
const varBoxRef = ref<InstanceType<typeof CustomBox> | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const getChildRoot = (instance: any): HTMLElement | null => {
	if (!instance) return null;
	if (instance.$el instanceof HTMLElement) return instance.$el;
	if (instance.root instanceof HTMLElement) return instance.root;
	return null;
};

const read = (): any => ym.value?.read();

const write = (value: any): void => {
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
const getFocus = (mode: any): any => ym.value?.getFocus(mode);
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);
const loadItems = (items: any[]): void => ym.value?.loadItems(items);

defineExpose({ read, write, switch: switchMode, enable, disable, getFocus, on, loadItems, root });

watch(
	() => props.modelValue,
	(val) => write(val)
);

onMounted(() => {
	const el = root.value as HTMLElement &
		Record<'read' | 'write' | 'switch' | 'enable' | 'disable' | 'getFocus' | 'on' | 'loadItems' | 'selectBox' | 'varBox' | 'mode', any>;
	if (!el) return;
	el.read = read;
	el.write = write;
	el.switch = switchMode;
	el.enable = enable;
	el.disable = disable;
	el.getFocus = getFocus;
	el.on = on;
	el.loadItems = loadItems;
	el.selectBox = (ym.value?.root?.querySelector('.select-box') as HTMLElement) ?? null;
	el.varBox = getChildRoot(varBoxRef.value);
	el.mode = el.classList.contains('variable') ? 'variable' : 'constant';
	watch(
		() => root.value?.className,
		() => {
			const cls = root.value?.className ?? '';
			el.mode = cls.includes('variable') ? 'variable' : 'constant';
			el.selectBox = (ym.value?.root?.querySelector('.select-box') as HTMLElement) ?? null;
			el.varBox = getChildRoot(varBoxRef.value);
			nextTick(() => {
				emit('update:modelValue', read());
			});
		}
	);
	watch(varBoxRef, (val) => {
		el.varBox = getChildRoot(val);
	});
	el.addEventListener('pointerdown', (event: PointerEvent) => {
		if (event.button !== 0 || event.target === el) return;
		const selectBox = (ym.value?.root?.querySelector('.select-box') as HTMLElement) ?? null;
		if (selectBox) Select.open(selectBox);
	});
	el.addEventListener('keydown', (event: KeyboardEvent) => {
		if ((event.code === 'Enter' || event.code === 'NumpadEnter') && !(event.ctrlKey || event.metaKey)) {
			event.stopPropagation();
			const selectBox = (ym.value?.root?.querySelector('.select-box') as HTMLElement) ?? null;
			if (selectBox) Select.open(selectBox);
		}
	});
	if (props.modelValue !== null && props.modelValue !== undefined) {
		write(props.modelValue);
	}
});
</script>
