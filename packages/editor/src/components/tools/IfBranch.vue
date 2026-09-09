<template>
	<WindowFrame id="if-branch" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.if-branch.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.if-branch-mode.label') }}</div>
			<SelectBox id="if-branch-mode" />
			<div class="text">{{ t('components.if-branch-conditions.label') }}</div>
			<ParamList id="if-branch-conditions" v-focus />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { $ } from '@app/utils/dom';
import { on } from '@app/utils/element-utils.ts';
import { useIfBranchSchema } from '@app/composables/useIfBranchSchema';

const IfBranch = useIfBranchSchema();
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const onConfirm = () => {
	IfBranch?.confirm?.(new Event('click'));
};

onMounted(() => {
	const modeEl = $('#if-branch-mode');
	if (!modeEl) return;
	modeEl.loadItems([
		{ name: 'Meet All', value: 'all' },
		{ name: 'Meet Any', value: 'any' }
	]);
	on($('#if-branch'), 'closed', () => IfBranch.windowClosed?.(new Event('closed')));
	on($('#if-branch-confirm'), 'click', () => IfBranch.confirm?.(new Event('click')));
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
