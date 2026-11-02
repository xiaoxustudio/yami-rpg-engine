<template>
	<WindowFrame id="loop" :ref="controlRef('loop')" @confirm="onConfirm" @closed="onClosed">
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
				:ref="controlRef('loop-mode')"
				v-model="form.mode"
			/>
			<div class="text">{{ t('components.loop-conditions.label') }}</div>
			<ParamList
				id="loop-conditions"
				:ref="controlRef('loop-conditions')"
				v-focus
				v-model="form.conditions"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
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
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'loop' | 'loop-conditions' | 'loop-mode';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save, reset } = useLoopCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口关闭时复位。 */
const onClosed = () => {
	reset();
	clear(controlRoot(controls['loop-conditions']));
};

onMounted(() => {
	controls['loop-conditions']?.bind?.(IfCondition);
	useLocalizedOptions('loop-mode', ['all', 'any'], (items) =>
		controls['loop-mode']?.loadItems?.(items)
	);
});
</script>

<style>
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
