<template>
	<WindowFrame id="loop" :ref="boxRef('loop')" @confirm="onConfirm" @closed="onClosed">
		<template #title
			><TitleBar
				>{{ t('components.loop.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.loop-mode.label') }}</div>
			<SelectBox
				:label="t('components.loop-mode.label')"
				id="loop-mode"
				v-tip="t('components.loop-mode.tip')"
				:ref="boxRef('loop-mode')"
				v-model="form.mode"
			/>
			<div class="text">{{ t('components.loop-conditions.label') }}</div>
			<ParamList
				id="loop-conditions"
				:ref="boxRef('loop-conditions')"
				v-focus
				v-model="form.conditions"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLoopCommandSchema } from '@app/composables/commands/useLoopCommandSchema';
import { clear } from '@app/utils/element-utils';
import { useIfConditionSchema } from '@app/composables/useIfConditionSchema';

const IfCondition = useIfConditionSchema();
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

// 控件用局部模板 ref 回调（存**元素**，relate/hide/show 需要 DOM 元素），不再进全局注册表。
type ControlElement = HTMLElement & {
	loadItems?: (items: unknown[]) => unknown;
	bind?: (value: unknown) => unknown;
	write?: (value: unknown) => void;
	read?: () => unknown;
};
const boxes: Record<string, ControlElement | null> = {};
const boxRef = (id: string) => (el: unknown) => {
	if (el == null) {
		boxes[id] = null;
		return;
	}
	if (el instanceof HTMLElement) {
		boxes[id] = el as ControlElement;
		return;
	}
	const instance = el as { $el?: unknown; root?: unknown };
	const root = instance.$el ?? instance.root ?? null;
	boxes[id] = root instanceof HTMLElement ? (root as ControlElement) : null;
};

const { t } = useI18n();

const { form, save, reset } = useLoopCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口关闭时复位。 */
const onClosed = () => {
	reset();
	clear(boxes['loop-conditions']);
};

onMounted(() => {
	boxes['loop-conditions']?.bind?.(IfCondition);
	useLocalizedOptions('loop-mode', ['all', 'any'], (items) =>
		boxes['loop-mode']?.loadItems?.(items)
	);
});
</script>

<style>
#loop {
	width: 324px;
	height: 204px;
}

#loop-conditions {
	height: 102px;
}

#loop-confirm {
	right: 108px;
	bottom: 10px;
}

#loop-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
