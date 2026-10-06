<template>
	<!-- 匹配 - 分支 -->
	<WindowFrame
		id="switch-branch"
		:ref="registryRef(fieldEls, 'switch-branch')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.switch-branch.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.switch-branch-conditions.label') }}</div>
			<ParamList
				id="switch-branch-conditions"
				:ref="registryRef(fieldEls, 'switch-branch-conditions')"
				v-focus
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { on } from '@app/utils/element-utils.ts';
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

onMounted(() => {
	// 该元素由本组件渲染：绑定放这里
	fieldEls.get('switch-branch-conditions')?.bind?.(SwitchCondition);
	on(fieldEls.get('switch-branch'), 'closed', () =>
		SwitchBranch.windowClosed?.(new Event('closed'))
	);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
