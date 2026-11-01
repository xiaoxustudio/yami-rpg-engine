<template>
	<WindowFrame id="setItem" :ref="boxRef('setItem')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setItem.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setItem-item.label') }}</div>
			<CustomBox
				id="setItem-item"
				:ref="boxRef('setItem-item')"
				v-tip="t('components.setItem-item.tip')"
				v-focus
				type="item"
				v-model="form.item"
			/>
			<div class="text">{{ t('components.setItem-operation.label') }}</div>
			<SelectBox
				:label="t('components.setItem-operation.label')"
				id="setItem-operation"
				v-tip="t('components.setItem-operation.tip')"
				:ref="boxRef('setItem-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setItem-quantity.label') }}</div>
			<NumberVar
				id="setItem-quantity"
				:ref="boxRef('setItem-quantity')"
				v-tip="t('components.setItem-quantity.tip')"
				min="1"
				max="10000"
				v-model="form.quantity"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetItemCommandSchema } from '@app/composables/commands/useSetItemCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

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

const { form, save } = useSetItemCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('setItem-operation', ['increase', 'decrease'], (items) =>
		boxes['setItem-operation']?.loadItems?.(items)
	);
});
</script>

<style>
#setItem {
	width: 324px;
	height: 146px;
}

#setItem-confirm {
	right: 108px;
	bottom: 10px;
}

#setItem-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
