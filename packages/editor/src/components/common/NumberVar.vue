<template>
	<YMNumberVar
		ref="ym"
		:min="props.min"
		:max="props.max"
		:step="props.step"
		:decimals="props.decimals"
		:unit="props.unit"
		:model-value="props.modelValue"
		:id="props.id"
	>
		<template #variable>
			<CustomBox
				ref="varBoxRef"
				type="variable"
				filter="number"
				:model-value="state.varValue ?? defVar"
				@update:model-value="(v: any) => (state.varValue = v)"
			/>
		</template>
	</YMNumberVar>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { YMNumberVar } from '@ui-kit';
import { defVar, defVarForPlugin } from '@/components/number-var';
import CustomBox from '@app/components/common/CustomBox.vue';

interface Props {
	id?: string;
	min?: number | string;
	max?: number | string;
	step?: number | string;
	decimals?: number | string;
	unit?: string;
	modelValue?: any;
}

const props = withDefaults(defineProps<Props>(), {
	min: '0',
	max: '0',
	step: '1',
	decimals: 0,
	unit: '',
	modelValue: null
});

const emit = defineEmits<{
	'update:modelValue': [value: any];
}>();

const state = reactive({
	varValue: null as any
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

const switchMode = (target?: string): void => ym.value?.switch(target as any);

const enable = (): void => ym.value?.enable();
const disable = (): void => ym.value?.disable();
const getFocus = (mode: any): any => ym.value?.getFocus(mode);
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ read, write, switch: switchMode, enable, disable, getFocus, on, root });

watch(
	() => props.modelValue,
	(val) => write(val)
);

onMounted(() => {
	const el = root.value as any;
	if (!el) return;
	el.read = read;
	el.write = write;
	el.switch = switchMode;
	el.enable = enable;
	el.disable = disable;
	el.getFocus = getFocus;
	el.on = on;
	el.mode = el.classList.contains('variable') ? 'variable' : 'constant';
	watch(
		() => root.value?.className,
		() => {
			const cls = root.value?.className ?? '';
			el.mode = cls.includes('variable') ? 'variable' : 'constant';
			el.numBox = (ym.value?.root?.querySelector('.number-box') as HTMLElement) ?? null;
			el.varBox = getChildRoot(varBoxRef.value);
			if (el.varBox) (el.varBox as any).isPluginInput = false;
			nextTick(() => {
				emit('update:modelValue', read());
			});
		}
	);
	watch(varBoxRef, (val) => {
		el.varBox = getChildRoot(val);
		if (el.varBox) (el.varBox as any).isPluginInput = false;
	});
	if (props.modelValue !== null && props.modelValue !== undefined) {
		write(props.modelValue);
	}
});
</script>
