<template>
	<WindowFrame id="loop" :ref="registryRef(fieldEls, 'loop')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.loop.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.loop-mode.label') }}</div>
			<SelectBox
				:label="t('components.loop-mode.label')"
				id="loop-mode"
				v-tip="t('components.loop-mode.tip')"
				:ref="registryRef(fieldEls, 'loop-mode')"
				v-model="form.mode"
			/>
			<div class="text">{{ t('components.loop-conditions.label') }}</div>
			<ParamList
				id="loop-conditions"
				:ref="registryRef(fieldEls, 'loop-conditions')"
				v-focus
				v-model="form.conditions"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
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
	useLocalizedOptions('loop-mode', ['all', 'any'], (items) =>
		fieldEls.get('loop-mode')?.loadItems?.(items)
	);
	fieldEls.get('loop')?.on?.('closed', () => {
		reset();
		clear(fieldEls.get('loop-conditions'));
	});
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
