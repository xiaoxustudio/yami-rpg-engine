<template>
	<WindowFrame id="switch" :ref="boxRef('switch')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.switch.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.switch-variable.label') }}</div>
			<CustomBox
				id="switch-variable"
				:ref="boxRef('switch-variable')"
				v-tip="t('components.switch-variable.tip')"
				v-focus
				type="variable"
				filter="all"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.switch-branches.label') }}</div>
			<ParamList
				id="switch-branches"
				:ref="boxRef('switch-branches')"
				v-focus
				v-model="form.branches"
			/>
		</div>
		<CheckBox
			id="switch-default"
			:ref="boxRef('switch-default')"
			v-model="form.default"
			class="standard"
			><div
				class="text"
				id="switch-default-label"
				:ref="boxRef('switch-default-label')"
				v-tip="t('components.switch-default-label.tip')"
			>
				{{ t('components.switch-default-label.content') }}
			</div></CheckBox
		>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { on } from '@app/utils/element-utils.ts';
import { useSwitchBranchSchema } from '@app/composables/useSwitchBranchSchema';

const SwitchBranch = useSwitchBranchSchema();
import { useSwitchCommandSchema } from '@app/composables/commands/useSwitchCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
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

const { form, save, windowClosed } = useSwitchCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	boxes['switch-branches']?.bind?.(SwitchBranch);
	on(boxes['switch'], 'closed', () => windowClosed(new Event('closed')));
});
</script>

<style>
#switch {
	width: 324px;
	height: 204px;
}

#switch-branches {
	height: 102px;
}

#switch-default {
	position: absolute;
	left: 10px;
	bottom: 10px;
}

#switch-confirm {
	right: 108px;
	bottom: 10px;
}

#switch-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
