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
		return;
	}
	if (event.code === 'Space') {
		event.preventDefault();
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
		:class="[$style.radioBox, { selected: selected, standard, disabled }]"
		role="radio"
		:aria-checked="selected"
		:aria-disabled="disabled || undefined"
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
:global(:where(.radio-box)) {
	display: inline-block;
	white-space: nowrap;
	cursor: pointer;
	user-select: none;
}

:global(:where(.radio-box.standard)) {
	display: block;
	padding: 2px 0;
	line-height: 16px;
}

:global(:where(.radio-box.standard:focus > .radio-mark)) {
	border-color: var(--ym-color-input-border-focus);
}

:global(:where(.radio-mark)) {
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

:global(.radio-mark::before) {
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

:global(.radio-box.selected > .radio-mark::before) {
	opacity: 1;
}

:global(.radio-box:active > .radio-mark::before) {
	opacity: 0.5;
}

:global(:where(.radio-box.disabled)) {
	pointer-events: none;
	opacity: 0.5;
}
</style>
