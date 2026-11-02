<template>
	<WindowFrame
		id="getMultipleActors"
		:ref="controlRef('getMultipleActors')"
		@confirm="onConfirm"
		@open="onWindowOpen"
	>
		<template #title
			><TitleBar
				>{{ t('components.getMultipleActors.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.getMultipleActors-variable.label') }}</div>
			<CustomBox
				id="getMultipleActors-variable"
				:ref="controlRef('getMultipleActors-variable')"
				v-tip="t('components.getMultipleActors-variable.tip')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.getMultipleActors-position.label') }}</div>
			<CustomBox
				id="getMultipleActors-position"
				:ref="controlRef('getMultipleActors-position')"
				v-tip="t('components.getMultipleActors-position.tip')"
				type="position"
				v-model="form.position"
			/>
			<div class="text">{{ t('components.getMultipleActors-area.label') }}</div>
			<SelectBox
				:label="t('components.getMultipleActors-area.label')"
				id="getMultipleActors-area"
				v-tip="t('components.getMultipleActors-area.tip')"
				:ref="controlRef('getMultipleActors-area')"
				v-model="form.area"
			/>
			<div class="text">{{ t('components.getMultipleActors-width.label') }}</div>
			<NumberVar
				id="getMultipleActors-width"
				v-tip="t('components.getMultipleActors-width.tip')"
				:ref="controlRef('getMultipleActors-width')"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.width"
			/>
			<div class="text">{{ t('components.getMultipleActors-height.label') }}</div>
			<NumberVar
				id="getMultipleActors-height"
				v-tip="t('components.getMultipleActors-height.tip')"
				:ref="controlRef('getMultipleActors-height')"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.height"
			/>
			<div class="text">{{ t('components.getMultipleActors-radius.label') }}</div>
			<NumberVar
				id="getMultipleActors-radius"
				v-tip="t('components.getMultipleActors-radius.tip')"
				:ref="controlRef('getMultipleActors-radius')"
				min="0"
				max="256"
				decimals="4"
				unit="tile"
				v-model="form.radius"
			/>
			<div class="text">{{ t('components.getMultipleActors-selector.label') }}</div>
			<SelectBox
				:label="t('components.getMultipleActors-selector.label')"
				id="getMultipleActors-selector"
				v-tip="t('components.getMultipleActors-selector.tip')"
				:ref="controlRef('getMultipleActors-selector')"
				v-model="form.selector"
			/>
			<div class="text">{{ t('components.getMultipleActors-teamId.label') }}</div>
			<SelectVar
				id="getMultipleActors-teamId"
				v-tip="t('components.getMultipleActors-teamId.tip')"
				:ref="controlRef('getMultipleActors-teamId')"
				v-model="form.teamId"
			/>
			<div class="text">{{ t('components.getMultipleActors-activation.label') }}</div>
			<SelectBox
				:label="t('components.getMultipleActors-activation.label')"
				id="getMultipleActors-activation"
				v-tip="t('components.getMultipleActors-activation.tip')"
				:ref="controlRef('getMultipleActors-activation')"
				v-model="form.activation"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGetMultipleActorsCommandSchema } from '@app/composables/commands/useGetMultipleActorsCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'getMultipleActors'
	| 'getMultipleActors-activation'
	| 'getMultipleActors-area'
	| 'getMultipleActors-height'
	| 'getMultipleActors-position'
	| 'getMultipleActors-radius'
	| 'getMultipleActors-selector'
	| 'getMultipleActors-teamId'
	| 'getMultipleActors-variable'
	| 'getMultipleActors-width';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useGetMultipleActorsCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口打开时刷新候选项。 */
const onWindowOpen = () => {
	const items = Data.createTeamItems!();
	controls['getMultipleActors-teamId']?.loadItems?.(items);
};

onMounted(() => {
	useLocalizedOptions(
		'getMultipleActors-area',
		['rectangle', 'circle'],
		(items) => controls['getMultipleActors-area']?.loadItems?.(items),
		{
			rectangle: 'command.getMultipleActors.rectangle',
			circle: 'command.getMultipleActors.circle'
		}
	);
	controls['getMultipleActors-area']?.enableHiddenMode?.();
	controls['getMultipleActors-area']?.relate?.([
		{
			case: 'rectangle',
			targets: [
				controlRoot(controls['getMultipleActors-width']),
				controlRoot(controls['getMultipleActors-height'])
			]
		},
		{ case: 'circle', targets: [controlRoot(controls['getMultipleActors-radius'])] }
	]);
	useLocalizedOptions('getMultipleActors-selector', ['enemy', 'friend', 'team', 'any'], (items) =>
		controls['getMultipleActors-selector']?.loadItems?.(items)
	);
	controls['getMultipleActors-selector']?.enableHiddenMode?.();
	controls['getMultipleActors-selector']?.relate?.([
		{
			case: ['enemy', 'friend', 'team'],
			targets: [controlRoot(controls['getMultipleActors-teamId'])]
		}
	]);
	useLocalizedOptions(
		'getMultipleActors-activation',
		['active', 'inactive', 'either'],
		(items) => controls['getMultipleActors-activation']?.loadItems?.(items),
		{
			active: 'command.getMultipleActors.active',
			inactive: 'command.getMultipleActors.inactive',
			either: 'command.getMultipleActors.either'
		}
	);
});
</script>

<style>
#getMultipleActors {
	width: 324px;
	height: 266px;
}

#getMultipleActors-confirm {
	right: 108px;
	bottom: 10px;
}

#getMultipleActors-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
