<template>
	<WindowFrame id="setNumber" :ref="boxRef('setNumber')" @confirm="onConfirm" @closed="onClosed">
		<template #title
			><TitleBar
				>{{ t('components.setNumber.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setNumber-variable.label') }}</div>
			<CustomBox
				id="setNumber-variable"
				:ref="boxRef('setNumber-variable')"
				v-tip="t('components.setNumber-variable.tip')"
				v-focus
				type="variable"
				filter="writable-number"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.setNumber-operands.label') }}</div>
			<ParamList
				id="setNumber-operands"
				:ref="boxRef('setNumber-operands')"
				v-focus
				v-model="form.operands"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetNumberCommandSchema } from '@app/composables/commands/useSetNumberCommandSchema';
import { clear } from '@app/utils/element-utils';
import { useNumberOperandSchema } from '@app/composables/useNumberOperandSchema';

const NumberOperand = useNumberOperandSchema();
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

const { form, save } = useSetNumberCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口关闭时清理。 */
const onClosed = () => {
	clear(boxes['setNumber-operands']);
};

onMounted(() => {
	boxes['setNumber-operands']?.bind?.(NumberOperand);
});
</script>

<style>
#setNumber {
	width: 324px;
	height: 204px;
}

#setNumber-operands {
	height: 102px;
}

#setNumber-confirm {
	right: 108px;
	bottom: 10px;
}

#setNumber-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
