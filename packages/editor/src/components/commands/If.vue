<template>
	<WindowFrame id="if" :ref="boxRef('if')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.if.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.if-branches.label') }}</div>
			<ParamList
				id="if-branches"
				:ref="boxRef('if-branches')"
				v-focus
				v-model="form.branches"
			/>
		</div>
		<CheckBox id="if-else" :ref="boxRef('if-else')" v-model="form.else" class="standard"
			><div
				class="text"
				id="if-else-label"
				:ref="boxRef('if-else-label')"
				v-tip="t('components.if-else-label.tip')"
			>
				{{ t('components.if-else-label.content') }}
			</div></CheckBox
		>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { on } from '@app/utils/element-utils.ts';
import { useIfBranchSchema } from '@app/composables/useIfBranchSchema';

const IfBranch = useIfBranchSchema();
import { useIfCommandSchema } from '@app/composables/commands/useIfCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
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

const { form, save, windowClosed } = useIfCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	boxes['if-branches']?.bind?.(IfBranch);
	on(boxes['if'], 'closed', () => windowClosed(new Event('closed')));
});
</script>

<style>
#if {
	width: 324px;
	height: 180px;
}

#if-branches {
	height: 102px;
}

#if-else {
	position: absolute;
	left: 10px;
	bottom: 10px;
}

#if-confirm {
	right: 108px;
	bottom: 10px;
}

#if-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
