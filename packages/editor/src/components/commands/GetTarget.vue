<template>
	<WindowFrame id="getTarget" :ref="controlRef('getTarget')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.getTarget.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.getTarget-actor.label') }}</div>
			<CustomBox
				id="getTarget-actor"
				:ref="controlRef('getTarget-actor')"
				v-tip="t('components.getTarget-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.getTarget-selector.label') }}</div>
			<SelectBox
				:label="t('components.getTarget-selector.label')"
				id="getTarget-selector"
				v-tip="t('components.getTarget-selector.tip')"
				:ref="controlRef('getTarget-selector')"
				v-model="form.selector"
			/>
			<div class="text">{{ t('components.getTarget-condition.label') }}</div>
			<SelectBox
				:label="t('components.getTarget-condition.label')"
				id="getTarget-condition"
				v-tip="t('components.getTarget-condition.tip')"
				:ref="controlRef('getTarget-condition')"
				v-model="form.condition"
			/>
			<div class="text">{{ t('components.getTarget-attribute.label') }}</div>
			<SelectBox
				:label="t('components.getTarget-attribute.label')"
				id="getTarget-attribute"
				v-tip="t('components.getTarget-attribute.tip')"
				:ref="controlRef('getTarget-attribute')"
				v-focus
				v-model="form.attribute"
			/>
			<div class="text">{{ t('components.getTarget-divisor.label') }}</div>
			<SelectBox
				:label="t('components.getTarget-divisor.label')"
				id="getTarget-divisor"
				v-tip="t('components.getTarget-divisor.tip')"
				:ref="controlRef('getTarget-divisor')"
				v-focus
				v-model="form.divisor"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGetTargetCommandSchema } from '@app/composables/commands/useGetTargetCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';
import {
	provideGetTargetBridge,
	resetGetTargetBridge,
	type GetTargetBridge
} from '@app/composables/get-target-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'getTarget-actor'
	| 'getTarget-attribute'
	| 'getTarget-condition'
	| 'getTarget-divisor'
	| 'getTarget-selector'
	| 'getTarget';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useGetTargetCommandSchema();

const onConfirm = () => {
	save();
};

/** 控件级能力：schema 载入时要候选项，但 schema 不该知道控件 id。 */
const bridgeApi: GetTargetBridge = {
	loadItems: (items) => {
		controls['getTarget-attribute']?.loadItems?.(items);
		controls['getTarget-divisor']?.loadItems?.(items);
	}
};

onMounted(() => {
	provideGetTargetBridge(bridgeApi);
	onUnmounted(() => resetGetTargetBridge(bridgeApi));
	useLocalizedOptions(
		'getTarget-selector',
		['enemy', 'friend', 'team', 'team-except-self', 'any-except-self', 'any'],
		(items) => controls['getTarget-selector']?.loadItems?.(items)
	);
	useLocalizedOptions(
		'getTarget-condition',
		[
			'max-threat',
			'nearest',
			'farthest',
			'min-attribute-value',
			'max-attribute-value',
			'min-attribute-ratio',
			'max-attribute-ratio',
			'random'
		],
		(items) => controls['getTarget-condition']?.loadItems?.(items),
		{
			'max-threat': 'command.getTarget.condition.max-threat',
			nearest: 'command.getTarget.condition.nearest',
			farthest: 'command.getTarget.condition.farthest',
			'min-attribute-value': 'command.getTarget.condition.min-attribute-value',
			'max-attribute-value': 'command.getTarget.condition.max-attribute-value',
			'min-attribute-ratio': 'command.getTarget.condition.min-attribute-ratio',
			'max-attribute-ratio': 'command.getTarget.condition.max-attribute-ratio',
			random: 'command.getTarget.condition.random'
		}
	);
	controls['getTarget-condition']?.enableHiddenMode?.();
	controls['getTarget-condition']?.relate?.([
		{
			case: ['min-attribute-value', 'max-attribute-value'],
			targets: [controlRoot(controls['getTarget-attribute'])]
		},
		{
			case: ['min-attribute-ratio', 'max-attribute-ratio'],
			targets: [
				controlRoot(controls['getTarget-attribute']),
				controlRoot(controls['getTarget-divisor'])
			]
		}
	]);
});
</script>

<style>
#getTarget {
	width: 324px;
	height: 194px;
}

#getTarget-confirm {
	right: 108px;
	bottom: 10px;
}

#getTarget-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
