<template>
	<WindowFrame
		id="setDialogBox"
		:ref="boxRef('setDialogBox')"
		@confirm="onConfirm"
		@closed="onClosed"
	>
		<template #title
			><TitleBar
				>{{ t('components.setDialogBox.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setDialogBox-element.label') }}</div>
			<CustomBox
				id="setDialogBox-element"
				:ref="boxRef('setDialogBox-element')"
				v-tip="t('components.setDialogBox-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.setDialogBox-properties.label') }}</div>
			<ParamList
				id="setDialogBox-properties"
				:ref="boxRef('setDialogBox-properties')"
				v-focus
				v-model="form.properties"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetDialogBoxCommandSchema } from '@app/composables/commands/useSetDialogBoxCommandSchema';
import { clear } from '@app/utils/element-utils';
import { DialogBoxProperty } from '@app/commands/property-window/set-dialog-property-window.ts';
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

const { form, save } = useSetDialogBoxCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口关闭时清理。 */
const onClosed = () => {
	clear(boxes['setDialogBox-properties']);
};

onMounted(() => {
	boxes['setDialogBox-properties']?.bind?.(DialogBoxProperty);
});
</script>

<style>
#setDialogBox {
	width: 324px;
	height: 204px;
}

#setDialogBox-properties {
	height: 102px;
}

#setDialogBox-confirm {
	right: 108px;
	bottom: 10px;
}

#setDialogBox-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
