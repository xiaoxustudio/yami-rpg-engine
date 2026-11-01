<template>
	<WindowFrame id="setLoop" :ref="boxRef('setLoop')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setLoop.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setLoop-type.label') }}</div>
			<SelectBox
				:label="t('components.setLoop-type.label')"
				id="setLoop-type"
				v-tip="t('components.setLoop-type.tip')"
				:ref="boxRef('setLoop-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.setLoop-loop.label') }}</div>
			<SelectBox
				:label="t('components.setLoop-loop.label')"
				id="setLoop-loop"
				v-tip="t('components.setLoop-loop.tip')"
				:ref="boxRef('setLoop-loop')"
				v-model="form.loop"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetLoopCommandSchema } from '@app/composables/commands/useSetLoopCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
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

const { form, save } = useSetLoopCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	boxes['setLoop-type']?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' }
	]);
	useLocalizedOptions(
		'setLoop-loop',
		[false, true],
		(items) => boxes['setLoop-loop']?.loadItems?.(items),
		{ false: 'command.setLoop.once', true: 'command.setLoop.loop' }
	);
});
</script>

<style>
#setLoop {
	width: 324px;
	height: 122px;
}

#setLoop-confirm {
	right: 108px;
	bottom: 10px;
}

#setLoop-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
