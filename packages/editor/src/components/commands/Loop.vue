<template>
	<WindowFrame id="loop"
				:ref="registryRef(fieldEls, 'loop')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.loop.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Mode</div>
			<SelectBox id="loop-mode"
				:ref="registryRef(fieldEls, 'loop-mode')" v-model="form.mode" />
			<div class="text">Conditions</div>
			<ParamList id="loop-conditions"
				:ref="registryRef(fieldEls, 'loop-conditions')" v-focus v-model="form.conditions" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLoopCommandSchema } from '@app/composables/commands/useLoopCommandSchema';
import { clear } from '@app/utils/element-utils';
import { useIfConditionSchema } from '@app/composables/useIfConditionSchema';

const IfCondition = useIfConditionSchema();
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { t } = useI18n();

const { form, save, reset } = useLoopCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('loop-conditions')?.bind?.(IfCondition);
	fieldEls.get('loop-mode')?.loadItems?.([
		{ name: 'Meet All', value: 'all' },
		{ name: 'Meet Any', value: 'any' }
	]);
	fieldEls.get('loop')?.on?.('closed', () => {
		reset();
		clear(fieldEls.get('loop-conditions'));
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#loop {
	width: 324px;
	height: 204px;
}

#loop-conditions {
	height: 102px;
}

#loop-confirm {
	right: 108px;
	bottom: 10px;
}

#loop-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
