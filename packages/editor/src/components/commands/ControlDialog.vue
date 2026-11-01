<template>
	<WindowFrame id="controlDialog" :ref="boxRef('controlDialog')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.controlDialog.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.controlDialog-element.label') }}</div>
			<CustomBox
				id="controlDialog-element"
				:ref="boxRef('controlDialog-element')"
				v-tip="t('components.controlDialog-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.controlDialog-operation.label') }}</div>
			<SelectBox
				:label="t('components.controlDialog-operation.label')"
				id="controlDialog-operation"
				v-tip="t('components.controlDialog-operation.tip')"
				:ref="boxRef('controlDialog-operation')"
				v-model="form.operation"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useControlDialogCommandSchema } from '@app/composables/commands/useControlDialogCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

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

const { form, save } = useControlDialogCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'controlDialog-operation',
		['pause', 'continue', 'print-immediately', 'print-next-page'],
		(items) => boxes['controlDialog-operation']?.loadItems?.(items),
		{
			pause: 'command.controlDialog.pause',
			continue: 'command.controlDialog.continue',
			'print-immediately': 'command.controlDialog.print-immediately',
			'print-next-page': 'command.controlDialog.print-next-page'
		}
	);
});
</script>

<style>
#controlDialog {
	width: 324px;
	height: 122px;
}

#controlDialog-confirm {
	right: 108px;
	bottom: 10px;
}

#controlDialog-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
