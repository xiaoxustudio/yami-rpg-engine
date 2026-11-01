<template>
	<WindowFrame id="setText" :ref="boxRef('setText')" @confirm="onConfirm" @closed="onClosed">
		<template #title
			><TitleBar
				>{{ t('components.setText.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setText-element.label') }}</div>
			<CustomBox
				id="setText-element"
				:ref="boxRef('setText-element')"
				v-tip="t('components.setText-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.setText-properties.label') }}</div>
			<ParamList
				id="setText-properties"
				:ref="boxRef('setText-properties')"
				v-focus
				v-model="form.properties"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetTextCommandSchema } from '@app/composables/commands/useSetTextCommandSchema';
import { clear } from '@app/utils/element-utils';
import { TextProperty } from '@app/commands/property-window/set-text-property-window.ts';
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

const { form, save } = useSetTextCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口关闭时清理。 */
const onClosed = () => {
	clear(boxes['setText-properties']);
};

onMounted(() => {
	boxes['setText-properties']?.bind?.(TextProperty);
});
</script>

<style>
#setText {
	width: 324px;
	height: 204px;
}

#setText-properties {
	height: 102px;
}

#setText-confirm {
	right: 108px;
	bottom: 10px;
}

#setText-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
