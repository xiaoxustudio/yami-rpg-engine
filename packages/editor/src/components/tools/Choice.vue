<template>
	<WindowFrame id="choice" :ref="boxRef('choice')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.choice.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.choice-content.label') }}</div>
			<TextBox
				:label="t('components.choice-content.label')"
				id="choice-content"
				:ref="boxRef('choice-content')"
				v-tip="t('components.choice-content.tip')"
				v-focus
				v-model="form.content"
				menu="tag-local-var tag-global-var tag-localization"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { on } from '@app/utils/element-utils.ts';
import { useChoicesSchema } from '@app/composables/useChoicesSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';

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

const Choices = useChoicesSchema();

const { t } = useI18n();

const form = Choices.form;

const onConfirm = () => {
	Choices?.confirm?.(new Event('click'));
};

onMounted(() => {
	on(boxes['choice'], 'closed', () => Choices.windowClosed?.(new Event('closed')));
});
</script>

<style>
#choice {
	width: 400px;
	height: 98px;
}

#choice-confirm {
	right: 108px;
	bottom: 10px;
}

#choice-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
