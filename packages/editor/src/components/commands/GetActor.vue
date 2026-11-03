<template>
	<WindowFrame
		id="getActor"
		:ref="controlRef('getActor')"
		@confirm="onConfirm"
		@open="onWindowOpen"
	>
		<template #title
			><TitleBar
				>{{ t('components.getActor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.getActor-variable.label') }}</div>
			<CustomBox
				id="getActor-variable"
				:ref="controlRef('getActor-variable')"
				v-tip="t('components.getActor-variable.tip')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.getActor-position.label') }}</div>
			<CustomBox
				id="getActor-position"
				:ref="controlRef('getActor-position')"
				v-tip="t('components.getActor-position.tip')"
				type="position"
				v-model="form.position"
			/>
			<div class="text">{{ t('components.getActor-area.label') }}</div>
			<SelectBox
				:label="t('components.getActor-area.label')"
				id="getActor-area"
				v-tip="t('components.getActor-area.tip')"
				:ref="controlRef('getActor-area')"
				v-model="form.area"
			/>
			<div class="text">{{ t('components.getActor-size.label') }}</div>
			<NumberVar
				id="getActor-size"
				v-tip="t('components.getActor-size.tip')"
				:ref="controlRef('getActor-size')"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.size"
			/>
			<div class="text">{{ t('components.getActor-radius.label') }}</div>
			<NumberVar
				id="getActor-radius"
				v-tip="t('components.getActor-radius.tip')"
				:ref="controlRef('getActor-radius')"
				min="0"
				max="256"
				decimals="4"
				unit="tile"
				v-model="form.radius"
			/>
			<div class="text">{{ t('components.getActor-selector.label') }}</div>
			<SelectBox
				:label="t('components.getActor-selector.label')"
				id="getActor-selector"
				v-tip="t('components.getActor-selector.tip')"
				:ref="controlRef('getActor-selector')"
				v-model="form.selector"
			/>
			<div class="text">{{ t('components.getActor-teamId.label') }}</div>
			<SelectVar
				id="getActor-teamId"
				v-tip="t('components.getActor-teamId.tip')"
				:ref="controlRef('getActor-teamId')"
				v-model="form.teamId"
			/>
			<div class="text">{{ t('components.getActor-condition.label') }}</div>
			<SelectBox
				:label="t('components.getActor-condition.label')"
				id="getActor-condition"
				v-tip="t('components.getActor-condition.tip')"
				:ref="controlRef('getActor-condition')"
				v-model="form.condition"
			/>
			<div class="text">{{ t('components.getActor-attribute.label') }}</div>
			<SelectBox
				:label="t('components.getActor-attribute.label')"
				id="getActor-attribute"
				v-tip="t('components.getActor-attribute.tip')"
				:ref="controlRef('getActor-attribute')"
				v-focus
				v-model="form.attribute"
			/>
			<div class="text">{{ t('components.getActor-divisor.label') }}</div>
			<SelectBox
				:label="t('components.getActor-divisor.label')"
				id="getActor-divisor"
				v-tip="t('components.getActor-divisor.tip')"
				:ref="controlRef('getActor-divisor')"
				v-focus
				v-model="form.divisor"
			/>
			<div class="text">{{ t('components.getActor-activation.label') }}</div>
			<SelectBox
				:label="t('components.getActor-activation.label')"
				id="getActor-activation"
				v-tip="t('components.getActor-activation.tip')"
				:ref="controlRef('getActor-activation')"
				v-model="form.activation"
			/>
			<div class="text">{{ t('components.getActor-exclusion.label') }}</div>
			<SelectBox
				:label="t('components.getActor-exclusion.label')"
				id="getActor-exclusion"
				v-tip="t('components.getActor-exclusion.tip')"
				:ref="controlRef('getActor-exclusion')"
				v-model="form.exclusion"
			/>
			<div class="text">{{ t('components.getActor-exclusionActor.label') }}</div>
			<CustomBox
				id="getActor-exclusionActor"
				v-tip="t('components.getActor-exclusionActor.tip')"
				:ref="controlRef('getActor-exclusionActor')"
				type="actor"
				v-model="form.exclusionActor"
			/>
			<div class="text">{{ t('components.getActor-exclusionTeamId.label') }}</div>
			<SelectVar
				id="getActor-exclusionTeamId"
				v-tip="t('components.getActor-exclusionTeamId.tip')"
				:ref="controlRef('getActor-exclusionTeamId')"
				v-model="form.exclusionTeamId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGetActorCommandSchema } from '@app/composables/commands/useGetActorCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';
import {
	provideGetActorBridge,
	resetGetActorBridge,
	type GetActorBridge
} from '@app/composables/get-actor-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'getActor-activation'
	| 'getActor-area'
	| 'getActor-attribute'
	| 'getActor-condition'
	| 'getActor-divisor'
	| 'getActor-exclusion'
	| 'getActor-exclusionActor'
	| 'getActor-exclusionTeamId'
	| 'getActor-position'
	| 'getActor-radius'
	| 'getActor-selector'
	| 'getActor-size'
	| 'getActor-teamId'
	| 'getActor-variable'
	| 'getActor';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useGetActorCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口打开时刷新候选项。 */
const onWindowOpen = () => {
	const items = Data.createTeamItems!();
	controls['getActor-teamId']?.loadItems?.(items);
	controls['getActor-exclusionTeamId']?.loadItems?.(items);
};

/** 控件级能力：schema 载入时要候选项，但 schema 不该知道控件 id。 */
const bridgeApi: GetActorBridge = {
	loadItems: (items) => {
		controls['getActor-attribute']?.loadItems?.(items);
		controls['getActor-divisor']?.loadItems?.(items);
	}
};

onMounted(() => {
	provideGetActorBridge(bridgeApi);
	onUnmounted(() => resetGetActorBridge(bridgeApi));
	useLocalizedOptions(
		'getActor-area',
		['square', 'circle'],
		(items) => controls['getActor-area']?.loadItems?.(items),
		{ square: 'command.getActor.square', circle: 'command.getActor.circle' }
	);
	controls['getActor-area']?.enableHiddenMode?.();
	controls['getActor-area']?.relate?.([
		{ case: 'square', targets: [controlRoot(controls['getActor-size'])] },
		{ case: 'circle', targets: [controlRoot(controls['getActor-radius'])] }
	]);
	useLocalizedOptions('getActor-selector', ['enemy', 'friend', 'team', 'any'], (items) =>
		controls['getActor-selector']?.loadItems?.(items)
	);
	controls['getActor-selector']?.enableHiddenMode?.();
	controls['getActor-selector']?.relate?.([
		{
			case: ['enemy', 'friend', 'team'],
			targets: [controlRoot(controls['getActor-teamId'])]
		}
	]);
	useLocalizedOptions(
		'getActor-condition',
		[
			'nearest',
			'farthest',
			'min-attribute-value',
			'max-attribute-value',
			'min-attribute-ratio',
			'max-attribute-ratio',
			'random'
		],
		(items) => controls['getActor-condition']?.loadItems?.(items),
		{
			nearest: 'command.getActor.condition.nearest',
			farthest: 'command.getActor.condition.farthest',
			'min-attribute-value': 'command.getActor.condition.min-attribute-value',
			'max-attribute-value': 'command.getActor.condition.max-attribute-value',
			'min-attribute-ratio': 'command.getActor.condition.min-attribute-ratio',
			'max-attribute-ratio': 'command.getActor.condition.max-attribute-ratio',
			random: 'command.getActor.condition.random'
		}
	);
	controls['getActor-condition']?.enableHiddenMode?.();
	controls['getActor-condition']?.relate?.([
		{
			case: ['min-attribute-value', 'max-attribute-value'],
			targets: [controlRoot(controls['getActor-attribute'])]
		},
		{
			case: ['min-attribute-ratio', 'max-attribute-ratio'],
			targets: [
				controlRoot(controls['getActor-attribute']),
				controlRoot(controls['getActor-divisor'])
			]
		}
	]);
	useLocalizedOptions(
		'getActor-activation',
		['active', 'inactive', 'either'],
		(items) => controls['getActor-activation']?.loadItems?.(items),
		{
			active: 'command.getActor.active',
			inactive: 'command.getActor.inactive',
			either: 'command.getActor.either'
		}
	);
	useLocalizedOptions('getActor-exclusion', ['none', 'actor', 'team'], (items) =>
		controls['getActor-exclusion']?.loadItems?.(items)
	);
	controls['getActor-exclusion']?.enableHiddenMode?.();
	controls['getActor-exclusion']?.relate?.([
		{ case: 'actor', targets: [controlRoot(controls['getActor-exclusionActor'])] },
		{ case: 'team', targets: [controlRoot(controls['getActor-exclusionTeamId'])] }
	]);
});
</script>

<style>
#getActor {
	width: 324px;
	height: 362px;
}

#getActor-confirm {
	right: 108px;
	bottom: 10px;
}

#getActor-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
