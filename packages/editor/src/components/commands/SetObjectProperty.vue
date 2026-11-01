<template>
	<WindowFrame
		id="setObjectProperty"
		:ref="boxRef('setObjectProperty')"
		@confirm="onConfirm"
		@closed="onClosed"
	>
		<template #title
			><TitleBar
				>{{ t('components.setObjectProperty.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setObjectProperty-variable.label') }}</div>
			<CustomBox
				id="setObjectProperty-variable"
				:ref="boxRef('setObjectProperty-variable')"
				v-tip="t('components.setObjectProperty-variable.tip')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.setObjectProperty-list.label') }}</div>
			<ParamList
				id="setObjectProperty-list"
				v-tip="t('components.setObjectProperty-list.tip')"
				:ref="boxRef('setObjectProperty-list')"
				v-focus
				v-model="form.list"
			/>
			<div class="text">{{ t('components.setObjectProperty-value-variable.label') }}</div>
			<CustomBox
				id="setObjectProperty-value-variable"
				:ref="boxRef('setObjectProperty-value-variable')"
				v-tip="t('components.setObjectProperty-value-variable.tip')"
				v-focus
				type="variable"
				filter="all"
				v-model="form.valueVariable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	useSetObjectPropertyCommandSchema,
	IndexBind
} from '@app/composables/commands/useGetObjectPropertyCommandSchema';
import { clear } from '@app/utils/element-utils';
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

const { form, save } = useSetObjectPropertyCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口关闭时清理。 */
const onClosed = () => {
	clear(boxes['setObjectProperty-list']);
};

onMounted(() => {
	boxes['setObjectProperty-list']?.bind?.(IndexBind);
});
</script>

<style>
#setObjectProperty {
	width: 324px;
	height: 220px;
}

#setObjectProperty-list {
	height: 102px;
}

#setObjectProperty-confirm {
	right: 108px;
	bottom: 10px;
}

#setObjectProperty-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
