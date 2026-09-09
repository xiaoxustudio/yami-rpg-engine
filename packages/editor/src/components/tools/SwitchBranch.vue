<template>
	<!-- 匹配 - 分支 -->
	<WindowFrame id="switch-branch" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.switch-branch.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.switch-branch-conditions.label') }}</div>
			<ParamList id="switch-branch-conditions" v-focus />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { $ } from '@app/utils/dom';
import { on } from '@app/utils/element-utils.ts';
import { useSwitchBranchSchema } from '@app/composables/useSwitchBranchSchema';

const SwitchBranch = useSwitchBranchSchema();
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const onConfirm = () => {
	SwitchBranch?.confirm?.(new Event('click'));
};

onMounted(() => {
	on($('#switch-branch'), 'closed', () => SwitchBranch.windowClosed?.(new Event('closed')));
	on($('#switch-branch-confirm'), 'click', () => SwitchBranch.confirm?.(new Event('click')));
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
