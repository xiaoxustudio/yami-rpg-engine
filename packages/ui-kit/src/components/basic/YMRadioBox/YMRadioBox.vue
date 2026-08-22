<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { radioGroups, type RadioGroupMember } from './group';

interface Props {
	id?: string;
	name: string;
	value: string | number | boolean;
	standard?: boolean;
	disabled?: boolean;
	selected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	standard: false,
	disabled: false,
	selected: false
});

const emit = defineEmits<{
	select: [value: string | number | boolean];
	change: [value: string | number | boolean];
}>();

const root = ref<HTMLElement | null>(null);
const selected = ref(props.selected);

const getGroup = (): Set<RadioGroupMember> => {
	let group = radioGroups.get(props.name);
	if (!group) {
		group = new Set();
		radioGroups.set(props.name, group);
	}
	return group;
};

const unselect = (): void => {
	selected.value = false;
};

const select = (): void => {
	const group = getGroup();
	for (const member of group) {
		if (member !== self) member.unselect();
	}
	selected.value = true;
	emit('select', props.value);
	emit('change', props.value);
};

const onPointerdown = (event: PointerEvent): void => {
	if (props.disabled || event.button !== 0) return;
	if (document.activeElement !== document.body) {
		(document.activeElement as HTMLElement | null)?.blur?.();
	}
	select();
};

const onKeydown = (event: KeyboardEvent): void => {
	if (props.disabled) return;
	if (event.code === 'Enter' || event.code === 'NumpadEnter') {
		event.stopPropagation();
		select();
	}
};

watch(
	() => props.selected,
	(val) => {
		selected.value = val;
	}
);

const self: RadioGroupMember = { unselect };

onMounted(() => {
	getGroup().add(self);
});

onBeforeUnmount(() => {
	getGroup().delete(self);
});

defineExpose({ root, select });
</script>

<template>
	<div
		ref="root"
		class="radio-box"
		:class="[
			$style.radioBox,
			{ selected: selected, standard, disabled }
		]"
		:id="props.id"
		:name="props.name"
		:tabindex="standard && !disabled ? 0 : undefined"
		@pointerdown="onPointerdown"
		@keydown="onKeydown"
	>
		<span v-if="standard" class="radio-mark" :class="$style.radioMark" />
		<slot />
	</div>
</template>

<style module>
.radioBox {
	display: inline-block;
	white-space: nowrap;
	cursor: pointer;
	user-select: none;
}

.radioBox:global(:where(.standard)) {
	display: block;
	padding: 2px 0;
	line-height: 16px;
}

.radioBox:global(:where(.standard)):focus .radioMark {
	border-color: var(--ym-color-input-border-focus);
}

.radioMark {
	display: inline-block;
	position: relative;
	vertical-align: top;
	margin-right: 4px;
	width: 16px;
	height: 16px;
	background-color: var(--ym-color-input-bg);
	border: 1px solid var(--ym-color-input-border);
	border-radius: 50%;
}

.radioMark::before {
	content: ' ';
	position: absolute;
	margin: -1px;
	padding: 3px;
	width: 10px;
	height: 10px;
	background-clip: content-box;
	background-color: var(--ym-radio-mark-color);
	border-radius: 50%;
	opacity: 0;
}

.radioBox:global(:where(.selected)) .radioMark::before {
	opacity: 1;
}

.radioBox:global(:where(.disabled)) {
	pointer-events: none;
	opacity: 0.5;
}
</style>
