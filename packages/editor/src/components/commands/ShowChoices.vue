<template>
	<WindowFrame id="showChoices" :ref="boxRef('showChoices')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.showChoices.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.showChoices-choices.label') }}</div>
			<ParamList
				id="showChoices-choices"
				v-tip="t('components.showChoices-choices.tip')"
				:ref="boxRef('showChoices-choices')"
				v-focus
				v-model="form.choices"
			/>
			<div class="text">{{ t('components.showChoices-parameters.label') }}</div>
			<TextBox
				:label="t('components.showChoices-parameters.label')"
				id="showChoices-parameters"
				:ref="boxRef('showChoices-parameters')"
				v-tip="t('components.showChoices-parameters.tip')"
				v-model="form.parameters"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { on } from '@app/utils/element-utils.ts';
import { useChoicesSchema } from '@app/composables/useChoicesSchema';

const Choices = useChoicesSchema();
import { useShowChoicesCommandSchema } from '@app/composables/commands/useShowChoicesCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';
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

const { form, save, windowClosed } = useShowChoicesCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	boxes['showChoices-choices']?.bind?.(Choices);
	on(boxes['showChoices'], 'closed', () => windowClosed(new Event('closed')));
});
</script>

<style>
#showChoices {
	width: 400px;
	height: 204px;
}

#showChoices-choices {
	height: 102px;
}

#showChoices-confirm {
	right: 108px;
	bottom: 10px;
}

#showChoices-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
