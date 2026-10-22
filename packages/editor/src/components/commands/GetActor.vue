<template>
	<WindowFrame
		id="getActor"
		:ref="registryRef(fieldEls, 'getActor')"
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
				:ref="registryRef(fieldEls, 'getActor-variable')"
				v-tip="t('components.getActor-variable.tip')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">{{ t('components.getActor-position.label') }}</div>
			<CustomBox
				id="getActor-position"
				:ref="registryRef(fieldEls, 'getActor-position')"
				v-tip="t('components.getActor-position.tip')"
				type="position"
				v-model="form.position"
			/>
			<div class="text">{{ t('components.getActor-area.label') }}</div>
			<SelectBox
				:label="t('components.getActor-area.label')"
				id="getActor-area"
				v-tip="t('components.getActor-area.tip')"
				:ref="registryRef(fieldEls, 'getActor-area')"
				v-model="form.area"
			/>
			<div class="text">{{ t('components.getActor-size.label') }}</div>
			<NumberVar
				id="getActor-size"
				v-tip="t('components.getActor-size.tip')"
				:ref="registryRef(fieldEls, 'getActor-size')"
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
				:ref="registryRef(fieldEls, 'getActor-radius')"
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
				:ref="registryRef(fieldEls, 'getActor-selector')"
				v-model="form.selector"
			/>
			<div class="text">{{ t('components.getActor-teamId.label') }}</div>
			<SelectVar
				id="getActor-teamId"
				v-tip="t('components.getActor-teamId.tip')"
				:ref="registryRef(fieldEls, 'getActor-teamId')"
				v-model="form.teamId"
			/>
			<div class="text">{{ t('components.getActor-condition.label') }}</div>
			<SelectBox
				:label="t('components.getActor-condition.label')"
				id="getActor-condition"
				v-tip="t('components.getActor-condition.tip')"
				:ref="registryRef(fieldEls, 'getActor-condition')"
				v-model="form.condition"
			/>
			<div class="text">{{ t('components.getActor-attribute.label') }}</div>
			<SelectBox
				:label="t('components.getActor-attribute.label')"
				id="getActor-attribute"
				v-tip="t('components.getActor-attribute.tip')"
				:ref="registryRef(fieldEls, 'getActor-attribute')"
				v-focus
				v-model="form.attribute"
			/>
			<div class="text">{{ t('components.getActor-divisor.label') }}</div>
			<SelectBox
				:label="t('components.getActor-divisor.label')"
				id="getActor-divisor"
				v-tip="t('components.getActor-divisor.tip')"
				:ref="registryRef(fieldEls, 'getActor-divisor')"
				v-focus
				v-model="form.divisor"
			/>
			<div class="text">{{ t('components.getActor-activation.label') }}</div>
			<SelectBox
				:label="t('components.getActor-activation.label')"
				id="getActor-activation"
				v-tip="t('components.getActor-activation.tip')"
				:ref="registryRef(fieldEls, 'getActor-activation')"
				v-model="form.activation"
			/>
			<div class="text">{{ t('components.getActor-exclusion.label') }}</div>
			<SelectBox
				:label="t('components.getActor-exclusion.label')"
				id="getActor-exclusion"
				v-tip="t('components.getActor-exclusion.tip')"
				:ref="registryRef(fieldEls, 'getActor-exclusion')"
				v-model="form.exclusion"
			/>
			<div class="text">{{ t('components.getActor-exclusionActor.label') }}</div>
			<CustomBox
				id="getActor-exclusionActor"
				v-tip="t('components.getActor-exclusionActor.tip')"
				:ref="registryRef(fieldEls, 'getActor-exclusionActor')"
				type="actor"
				v-model="form.exclusionActor"
			/>
			<div class="text">{{ t('components.getActor-exclusionTeamId.label') }}</div>
			<SelectVar
				id="getActor-exclusionTeamId"
				v-tip="t('components.getActor-exclusionTeamId.tip')"
				:ref="registryRef(fieldEls, 'getActor-exclusionTeamId')"
				v-model="form.exclusionTeamId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGetActorCommandSchema } from '@app/composables/commands/useGetActorCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useGetActorCommandSchema();

const onConfirm = () => {
	save();
};

/** 窗口打开时刷新候选项。 */
const onWindowOpen = () => {
	const items = Data.createTeamItems!();
	fieldEls.get('getActor-teamId')?.loadItems?.(items);
	fieldEls.get('getActor-exclusionTeamId')?.loadItems?.(items);
};

onMounted(() => {
	useLocalizedOptions(
		'getActor-area',
		['square', 'circle'],
		(items) => fieldEls.get('getActor-area')?.loadItems?.(items),
		{ square: 'command.getActor.square', circle: 'command.getActor.circle' }
	);
	fieldEls
		.get('getActor-area')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'square', targets: [fieldEls.get('getActor-size')] },
			{ case: 'circle', targets: [fieldEls.get('getActor-radius')] }
		]);
	useLocalizedOptions('getActor-selector', ['enemy', 'friend', 'team', 'any'], (items) =>
		fieldEls.get('getActor-selector')?.loadItems?.(items)
	);
	fieldEls
		.get('getActor-selector')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['enemy', 'friend', 'team'],
				targets: [fieldEls.get('getActor-teamId')]
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
		(items) => fieldEls.get('getActor-condition')?.loadItems?.(items),
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
	fieldEls
		.get('getActor-condition')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['min-attribute-value', 'max-attribute-value'],
				targets: [fieldEls.get('getActor-attribute')]
			},
			{
				case: ['min-attribute-ratio', 'max-attribute-ratio'],
				targets: [fieldEls.get('getActor-attribute'), fieldEls.get('getActor-divisor')]
			}
		]);
	useLocalizedOptions(
		'getActor-activation',
		['active', 'inactive', 'either'],
		(items) => fieldEls.get('getActor-activation')?.loadItems?.(items),
		{
			active: 'command.getActor.active',
			inactive: 'command.getActor.inactive',
			either: 'command.getActor.either'
		}
	);
	useLocalizedOptions('getActor-exclusion', ['none', 'actor', 'team'], (items) =>
		fieldEls.get('getActor-exclusion')?.loadItems?.(items)
	);
	fieldEls
		.get('getActor-exclusion')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'actor', targets: [fieldEls.get('getActor-exclusionActor')] },
			{ case: 'team', targets: [fieldEls.get('getActor-exclusionTeamId')] }
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
