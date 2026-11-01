<template>
	<WindowFrame id="setButton" :ref="boxRef('setButton')" @confirm="onConfirm" @closed="onClosed">
		<template #title
			><TitleBar
				>{{ t('components.setButton.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setButton-element.label') }}</div>
			<CustomBox
				id="setButton-element"
				:ref="boxRef('setButton-element')"
				v-tip="t('components.setButton-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.setButton-properties.label') }}</div>
			<ParamList
				id="setButton-properties"
				:ref="boxRef('setButton-properties')"
				v-focus
				v-model="form.properties"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetButtonCommandSchema } from '@app/composables/commands/useSetButtonCommandSchema';
import { clear } from '@app/utils/element-utils';
import { ButtonProperty } from '@app/commands/property-window/set-button-property-window.ts';
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

const { form, save } = useSetButtonCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口关闭时清理。 */
const onClosed = () => {
	clear(boxes['setButton-properties']);
};

onMounted(() => {
	boxes['setButton-properties']?.bind?.(ButtonProperty);
});
</script>

<style>
#setButton {
	width: 324px;
	height: 204px;
}

#setButton-properties {
	height: 102px;
}

#setButton-confirm {
	right: 108px;
	bottom: 10px;
}

#setButton-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
