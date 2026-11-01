<template>
	<WindowFrame
		id="getObjectProperty"
		:ref="boxRef('getObjectProperty')"
		@confirm="onConfirm"
		@closed="onClosed"
	>
		<template #title
			><TitleBar
				>{{ t('components.getObjectProperty.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.getObjectProperty-variable.label') }}</div>
			<CustomBox
				id="getObjectProperty-variable"
				:ref="boxRef('getObjectProperty-variable')"
				v-tip="t('components.getObjectProperty-variable.tip')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.getObjectProperty-list.label') }}</div>
			<ParamList
				id="getObjectProperty-list"
				v-tip="t('components.getObjectProperty-list.tip')"
				:ref="boxRef('getObjectProperty-list')"
				v-focus
				v-model="form.properties"
			/>
			<div class="text">{{ t('components.getObjectProperty-save-variable.label') }}</div>
			<CustomBox
				id="getObjectProperty-save-variable"
				:ref="boxRef('getObjectProperty-save-variable')"
				v-tip="t('components.getObjectProperty-save-variable.tip')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.saveVariable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGetObjectPropertyCommandSchema } from '@app/composables/commands/useGetObjectPropertyCommandSchema';
import { clear } from '@app/utils/element-utils';
import { IndexBind } from '@app/composables/commands/useGetObjectPropertyCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

// 控件用局部模板 ref 回调（存**元素**：relate/hide/show 需要 DOM 元素），不再进全局注册表。
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

const { form, save } = useGetObjectPropertyCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口关闭时清空列表。 */
const onClosed = () => {
	clear(boxes['getObjectProperty-list']);
};

onMounted(() => {
	boxes['getObjectProperty-list']?.bind?.(IndexBind);
});
</script>

<style>
#getObjectProperty {
	width: 324px;
	height: 220px;
}

#getObjectProperty-list {
	height: 102px;
}

#getObjectProperty-confirm {
	right: 108px;
	bottom: 10px;
}

#getObjectProperty-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
