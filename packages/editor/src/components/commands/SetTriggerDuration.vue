<template>
	<WindowFrame
		id="setTriggerDuration"
		:ref="controlRef('setTriggerDuration')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.setTriggerDuration.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setTriggerDuration-trigger.label') }}</div>
			<CustomBox
				id="setTriggerDuration-trigger"
				:ref="controlRef('setTriggerDuration-trigger')"
				v-tip="t('components.setTriggerDuration-trigger.tip')"
				v-focus
				type="trigger"
				v-model="form.trigger"
			/>
			<div class="text">{{ t('components.setTriggerDuration-operation.label') }}</div>
			<SelectBox
				:label="t('components.setTriggerDuration-operation.label')"
				id="setTriggerDuration-operation"
				v-tip="t('components.setTriggerDuration-operation.tip')"
				:ref="controlRef('setTriggerDuration-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setTriggerDuration-duration.label') }}</div>
			<NumberVar
				id="setTriggerDuration-duration"
				:ref="controlRef('setTriggerDuration-duration')"
				v-tip="t('components.setTriggerDuration-duration.tip')"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetTriggerDurationCommandSchema } from '@app/composables/commands/useSetTriggerDurationCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'setTriggerDuration'
	| 'setTriggerDuration-duration'
	| 'setTriggerDuration-operation'
	| 'setTriggerDuration-trigger';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetTriggerDurationCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('setTriggerDuration-operation', ['set', 'increase', 'decrease'], (items) =>
		controls['setTriggerDuration-operation']?.loadItems?.(items)
	);
});
</script>

<style>
#setTriggerDuration {
	width: 324px;
	height: 146px;
}

#setTriggerDuration-confirm {
	right: 108px;
	bottom: 10px;
}

#setTriggerDuration-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
