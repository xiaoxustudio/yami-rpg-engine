<template>
	<WindowFrame id="setImage" :ref="boxRef('setImage')" @confirm="onConfirm" @closed="onClosed">
		<template #title
			><TitleBar
				>{{ t('components.setImage.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setImage-element.label') }}</div>
			<CustomBox
				id="setImage-element"
				:ref="boxRef('setImage-element')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.setImage-properties.label') }}</div>
			<ParamList
				id="setImage-properties"
				:ref="boxRef('setImage-properties')"
				v-focus
				v-model="form.properties"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetImageCommandSchema } from '@app/composables/commands/useSetImageCommandSchema';
import { clear } from '@app/utils/element-utils';
import { ImageProperty } from '@app/commands/property-window/set-image-property-window.ts';
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

const { form, save } = useSetImageCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口关闭时清理。 */
const onClosed = () => {
	clear(boxes['setImage-properties']);
};

onMounted(() => {
	boxes['setImage-properties']?.bind?.(ImageProperty);
});
</script>

<style>
#setImage {
	width: 324px;
	height: 204px;
}

#setImage-properties {
	height: 102px;
}

#setImage-confirm {
	right: 108px;
	bottom: 10px;
}

#setImage-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
