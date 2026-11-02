<template>
	<WindowFrame id="setEvent" :ref="controlRef('setEvent')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setEvent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setEvent-operation.label') }}</div>
			<SelectBox
				:label="t('components.setEvent-operation.label')"
				id="setEvent-operation"
				v-tip="t('components.setEvent-operation.tip')"
				:ref="controlRef('setEvent-operation')"
				v-focus
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setEvent-variable.label') }}</div>
			<CustomBox
				id="setEvent-variable"
				v-tip="t('components.setEvent-variable.tip')"
				:ref="controlRef('setEvent-variable')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.setEvent-eventId.label') }}</div>
			<CustomBox
				id="setEvent-eventId"
				v-tip="t('components.setEvent-eventId.tip')"
				:ref="controlRef('setEvent-eventId')"
				v-focus
				type="file"
				filter="event"
				v-model="form.eventId"
			/>
			<div class="text">{{ t('components.setEvent-choiceIndex.label') }}</div>
			<NumberVar
				id="setEvent-choiceIndex"
				v-tip="t('components.setEvent-choiceIndex.tip')"
				:ref="controlRef('setEvent-choiceIndex')"
				min="0"
				max="255"
				v-model="form.choiceIndex"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetEventCommandSchema } from '@app/composables/commands/useSetEventCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'setEvent'
	| 'setEvent-choiceIndex'
	| 'setEvent-eventId'
	| 'setEvent-operation'
	| 'setEvent-variable';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetEventCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'setEvent-operation',
		[
			'stop-propagation',
			'pause',
			'continue',
			'enable',
			'disable',
			'highest-priority',
			'goto-choice-branch'
		],
		(items) => controls['setEvent-operation']?.loadItems?.(items),
		{
			'stop-propagation': 'command.setEvent.stop-propagation',
			pause: 'command.setEvent.pause',
			continue: 'command.setEvent.continue',
			enable: 'command.setEvent.enable',
			disable: 'command.setEvent.disable',
			'highest-priority': 'command.setEvent.highest-priority',
			'goto-choice-branch': 'command.setEvent.goto-choice-branch'
		}
	);
	controls['setEvent-operation']?.enableHiddenMode?.();
	controls['setEvent-operation']?.relate?.([
		{
			case: ['pause', 'continue'],
			targets: [controlRoot(controls['setEvent-variable'])]
		},
		{
			case: ['enable', 'disable', 'highest-priority'],
			targets: [controlRoot(controls['setEvent-eventId'])]
		},
		{
			case: 'goto-choice-branch',
			targets: [controlRoot(controls['setEvent-choiceIndex'])]
		}
	]);
});
</script>

<style>
#setEvent {
	width: 324px;
	height: 122px;
}

#setEvent-confirm {
	right: 108px;
	bottom: 10px;
}

#setEvent-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
