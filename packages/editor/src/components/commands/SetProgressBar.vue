<template>
	<WindowFrame
		id="setProgressBar"
		:ref="boxRef('setProgressBar')"
		@confirm="onConfirm"
		@closed="onClosed"
	>
		<template #title
			><TitleBar
				>{{ t('components.setProgressBar.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setProgressBar-element.label') }}</div>
			<CustomBox
				id="setProgressBar-element"
				:ref="boxRef('setProgressBar-element')"
				v-tip="t('components.setProgressBar-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.setProgressBar-properties.label') }}</div>
			<ParamList
				id="setProgressBar-properties"
				:ref="boxRef('setProgressBar-properties')"
				v-focus
				v-model="form.properties"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetProgressBarCommandSchema } from '@app/composables/commands/useSetProgressBarCommandSchema';
import { clear } from '@app/utils/element-utils';
import { ProgressBarProperty } from '@app/commands/property-window/set-progress-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
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

const { form, save } = useSetProgressBarCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口关闭时清理。 */
const onClosed = () => {
	clear(boxes['setProgressBar-properties']);
};

onMounted(() => {
	boxes['setProgressBar-properties']?.bind?.(ProgressBarProperty);
});
</script>

<style>
#setProgressBar {
	width: 324px;
	height: 204px;
}

#setProgressBar-properties {
	height: 102px;
}

#setProgressBar-confirm {
	right: 108px;
	bottom: 10px;
}

#setProgressBar-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
