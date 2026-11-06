<template>
	<WindowFrame id="switch-branch" ref="frame" @confirm="onConfirm" @closed="onWindowClosed">
		<template #title
			><TitleBar
				>{{ t('components.switch-branch.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.switch-branch-conditions.label') }}</div>
			<ParamList id="switch-branch-conditions" ref="conditionsRef" v-focus />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import {
	provideSwitchBranch,
	resetSwitchBranch,
	type SwitchBranchApi
} from '@app/composables/tool-window-bridges';
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSwitchBranchSchema } from '@app/composables/useSwitchBranchSchema';
import { useSwitchConditionSchema } from '@app/composables/useSwitchConditionSchema';

const SwitchBranch = useSwitchBranchSchema();
const SwitchCondition = useSwitchConditionSchema();
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const onConfirm = () => {
	SwitchBranch?.confirm?.(new Event('click'));
};

const conditionsRef = ref<InstanceType<typeof ParamList> | null>(null);

const bridgeApi: SwitchBranchApi = {
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
	SwitchBranch.windowClosed?.(new Event('closed'));
};

onMounted(() => {
	conditionsRef.value?.bind?.(SwitchCondition);
	provideSwitchBranch(bridgeApi);
	onUnmounted(() => resetSwitchBranch(bridgeApi));
});
</script>

<style>
#switch-branch {
	width: 324px;
	height: 180px;
}

#switch-branch-conditions {
	height: 102px;
}

#switch-branch-confirm {
	right: 108px;
	bottom: 10px;
}

#switch-branch-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
