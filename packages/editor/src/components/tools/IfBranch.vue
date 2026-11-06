<template>
	<WindowFrame id="if-branch" ref="frame" @confirm="onConfirm" @closed="onWindowClosed">
		<template #title
			><TitleBar
				>{{ t('components.if-branch.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.if-branch-mode.label') }}</div>
			<SelectBox
				:label="t('components.if-branch-mode.label')"
				id="if-branch-mode"
				v-tip="t('components.if-branch-mode.tip')"
				ref="modeRef"
			/>
			<div class="text">{{ t('components.if-branch-conditions.label') }}</div>
			<ParamList id="if-branch-conditions" ref="conditionsRef" v-focus />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import {
	provideIfBranch,
	resetIfBranch,
	type IfBranchApi
} from '@app/composables/tool-window-bridges';
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useIfBranchSchema } from '@app/composables/useIfBranchSchema';
import { useIfConditionSchema } from '@app/composables/useIfConditionSchema';

const IfBranch = useIfBranchSchema();
const IfCondition = useIfConditionSchema();
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const onConfirm = () => {
	IfBranch?.confirm?.(new Event('click'));
};

const modeRef = ref<InstanceType<typeof SelectBox> | null>(null);
const conditionsRef = ref<InstanceType<typeof ParamList> | null>(null);

const bridgeApi: IfBranchApi = {
	setMode: (mode) => {
		modeRef.value?.write?.(mode);
	},
	getMode: () => modeRef.value?.read?.(),
	setConditions: (conditions) => {
		conditionsRef.value?.write?.(conditions);
	},
	getConditions: () => (conditionsRef.value?.read?.() as unknown[]) ?? [],
	clearConditions: () => {
		conditionsRef.value?.clear?.();
	}
};

/** 关闭时通知单例（原来靠本地注册表取根元素挂监听）。 */
const onWindowClosed = (): void => {
	IfBranch.windowClosed?.(new Event('closed'));
};

onMounted(() => {
	conditionsRef.value?.bind?.(IfCondition);
	modeRef.value?.loadItems([
		{ name: 'Meet All', value: 'all' },
		{ name: 'Meet Any', value: 'any' }
	]);
	provideIfBranch(bridgeApi);
	onUnmounted(() => resetIfBranch(bridgeApi));
});
</script>

<style>
#if-branch {
	width: 324px;
	height: 200px;
}

#if-branch-conditions {
	height: 102px;
}

#if-branch-confirm {
	right: 108px;
	bottom: 10px;
}

#if-branch-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
