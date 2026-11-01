<template>
	<WindowFrame id="setElement" :ref="boxRef('setElement')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setElement.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setElement-element.label') }}</div>
			<CustomBox
				id="setElement-element"
				:ref="boxRef('setElement-element')"
				v-tip="t('components.setElement-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.setElement-operation.label') }}</div>
			<SelectBox
				:label="t('components.setElement-operation.label')"
				id="setElement-operation"
				v-tip="t('components.setElement-operation.tip')"
				:ref="boxRef('setElement-operation')"
				v-model="form.operation"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetElementCommandSchema } from '@app/composables/commands/useSetElementCommandSchema';
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

const { form, save } = useSetElementCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'setElement-operation',
		[
			'hide',
			'show',
			'disable-pointer-events',
			'enable-pointer-events',
			'skip-pointer-events',
			'move-to-first',
			'move-to-last'
		],
		(items) => boxes['setElement-operation']?.loadItems?.(items),
		{
			hide: 'command.setElement.hide',
			show: 'command.setElement.show',
			'disable-pointer-events': 'command.setElement.disable-pointer-events',
			'enable-pointer-events': 'command.setElement.enable-pointer-events',
			'skip-pointer-events': 'command.setElement.skip-pointer-events',
			'move-to-first': 'command.setElement.move-to-first',
			'move-to-last': 'command.setElement.move-to-last'
		}
	);
});
</script>

<style>
#setElement {
	width: 324px;
	height: 122px;
}

#setElement-confirm {
	right: 108px;
	bottom: 10px;
}

#setElement-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
