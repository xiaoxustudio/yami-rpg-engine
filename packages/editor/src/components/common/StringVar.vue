<template>
	<YMStringVar
		ref="ym"
		:model-value="props.modelValue"
		@update:model-value="onValue"
		:id="props.id"
	>
		<template #variable>
			<CustomBox
				ref="varBoxRef"
				type="variable"
				filter="string"
				:model-value="state.varValue ?? defVar"
				@input="onVarValue"
			/>
		</template>
	</YMStringVar>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { elementDataOf, YMStringVar } from '@ui-kit';
import { defVar } from '@app/components/string-var';
import CustomBox from '@app/components/common/CustomBox.vue';
import { attachElementApi } from '@app/utils/attach-element-api';

interface Props {
	id?: string;
	modelValue?: unknown;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null as never
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
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);
const varBoxRef = ref<InstanceType<typeof CustomBox> | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const getChildRoot = (instance: { $el?: unknown; root?: unknown } | null): HTMLElement | null => {
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

const onValue = (value: unknown): void => {
	emit('update:modelValue', value);
};

const onVarValue = (value: unknown): void => {
	state.varValue = value;
	emit('update:modelValue', value);
};

defineExpose({ read, write, switch: switchMode, enable, disable, getFocus, on, root });

const api = {
	mode: 'constant',
	read,
	write,
	switch: switchMode,
	enable,
	disable,
	getFocus,
	on
};

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
			listener: (event: unknown) => void,
			options?: boolean | AddEventListenerOptions
		): void;
		mode: string;
		strBox: HTMLElement | null;
		varBox: HTMLElement | null;
	};
	if (!el) return;
	api.mode = el.classList.contains('variable') ? 'variable' : 'constant';
	attachElementApi(el, api);
	watch(
		() => root.value?.className,
		() => {
			const cls = root.value?.className ?? '';
			api.mode = cls.includes('variable') ? 'variable' : 'constant';
			// P4b：strBox 走显式元素数据（字段已从 DATA_FIELDS 摘除）
			elementDataOf<{ strBox: HTMLElement | null }>(el).strBox =
				(ym.value?.root?.querySelector('.text-box') as HTMLElement) ?? null;
			elementDataOf<{ varBox: HTMLElement | null }>(el).varBox = getChildRoot(
				varBoxRef.value
			);
			nextTick(() => {
				emit('update:modelValue', read());
			});
		}
	);
	watch(varBoxRef, (val) => {
		elementDataOf<{ varBox: HTMLElement | null }>(el).varBox = getChildRoot(val);
	});
	if (props.modelValue !== null && props.modelValue !== undefined) {
		write(props.modelValue);
	}
});
</script>
