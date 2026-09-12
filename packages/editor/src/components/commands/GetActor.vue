<template>
	<WindowFrame id="getActor"
				:ref="registryRef(fieldEls, 'getActor')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.getActor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Write to Variable</div>
			<CustomBox
				id="getActor-variable"
				v-tip="t('components.getActor-variable.tip')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">Position</div>
			<CustomBox id="getActor-position"
				v-tip="t('components.getActor-position.tip')" type="position" v-model="form.position" />
			<div class="text">Area</div>
			<SelectBox id="getActor-area"
				v-tip="t('components.getActor-area.tip')"
				:ref="registryRef(fieldEls, 'getActor-area')" v-model="form.area" />
			<div class="text">Size</div>
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
			<div class="text">Radius</div>
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
			<div class="text">Selector</div>
			<SelectBox id="getActor-selector"
				v-tip="t('components.getActor-selector.tip')"
				:ref="registryRef(fieldEls, 'getActor-selector')" v-model="form.selector" />
			<div class="text">Team</div>
			<SelectVar id="getActor-teamId"
				v-tip="t('components.getActor-teamId.tip')"
				:ref="registryRef(fieldEls, 'getActor-teamId')" v-model="form.teamId" />
			<div class="text">Condition</div>
			<SelectBox id="getActor-condition"
				v-tip="t('components.getActor-condition.tip')"
				:ref="registryRef(fieldEls, 'getActor-condition')" v-model="form.condition" />
			<div class="text">Attribute</div>
			<SelectBox id="getActor-attribute"
				v-tip="t('components.getActor-attribute.tip')"
				:ref="registryRef(fieldEls, 'getActor-attribute')" v-focus v-model="form.attribute" />
			<div class="text">Attribute 2</div>
			<SelectBox id="getActor-divisor"
				v-tip="t('components.getActor-divisor.tip')"
				:ref="registryRef(fieldEls, 'getActor-divisor')" v-focus v-model="form.divisor" />
			<div class="text">Activation</div>
			<SelectBox id="getActor-activation"
				v-tip="t('components.getActor-activation.tip')"
				:ref="registryRef(fieldEls, 'getActor-activation')" v-model="form.activation" />
			<div class="text">Exclusion</div>
			<SelectBox id="getActor-exclusion"
				v-tip="t('components.getActor-exclusion.tip')"
				:ref="registryRef(fieldEls, 'getActor-exclusion')" v-model="form.exclusion" />
			<div class="text">Exclusion Actor</div>
			<CustomBox id="getActor-exclusionActor"
				v-tip="t('components.getActor-exclusionActor.tip')"
				:ref="registryRef(fieldEls, 'getActor-exclusionActor')" type="actor" v-model="form.exclusionActor" />
			<div class="text">Exclusion Team</div>
			<SelectVar id="getActor-exclusionTeamId"
				v-tip="t('components.getActor-exclusionTeamId.tip')"
				:ref="registryRef(fieldEls, 'getActor-exclusionTeamId')" v-model="form.exclusionTeamId" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
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

onMounted(() => {
	fieldEls.get('getActor-area')?.loadItems?.([
		{ name: t('command.getActor.square') || 'Square', value: 'square' },
		{ name: t('command.getActor.circle') || 'Circle', value: 'circle' }
	]);
	fieldEls.get('getActor-area')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'square', targets: [fieldEls.get('getActor-size')] },
			{ case: 'circle', targets: [fieldEls.get('getActor-radius')] }
		]);
	fieldEls.get('getActor-selector')?.loadItems?.([
		{ name: 'Team Enemy', value: 'enemy' },
		{ name: 'Team Friend', value: 'friend' },
		{ name: 'Team Member', value: 'team' },
		{ name: 'Any', value: 'any' }
	]);
	fieldEls.get('getActor-selector')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['enemy', 'friend', 'team'],
				targets: [fieldEls.get('getActor-teamId')]
			}
		]);
	fieldEls.get('getActor-condition')?.loadItems?.([
		{ name: t('command.getActor.condition.nearest') || 'Nearest', value: 'nearest' },
		{ name: t('command.getActor.condition.farthest') || 'Farthest', value: 'farthest' },
		{
			name: t('command.getActor.condition.min-attribute-value') || 'Min Attribute Value',
			value: 'min-attribute-value'
		},
		{
			name: t('command.getActor.condition.max-attribute-value') || 'Max Attribute Value',
			value: 'max-attribute-value'
		},
		{
			name: t('command.getActor.condition.min-attribute-ratio') || 'Min Attribute Ratio',
			value: 'min-attribute-ratio'
		},
		{
			name: t('command.getActor.condition.max-attribute-ratio') || 'Max Attribute Ratio',
			value: 'max-attribute-ratio'
		},
		{ name: t('command.getActor.condition.random') || 'Random', value: 'random' }
	]);
	fieldEls.get('getActor-condition')
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
	fieldEls.get('getActor-activation')?.loadItems?.([
		{ name: t('command.getActor.active') || 'Active', value: 'active' },
		{ name: t('command.getActor.inactive') || 'Inactive', value: 'inactive' },
		{ name: t('command.getActor.either') || 'Either', value: 'either' }
	]);
	fieldEls.get('getActor-exclusion')?.loadItems?.([
		{ name: 'None', value: 'none' },
		{ name: 'Exclude an Actor', value: 'actor' },
		{ name: 'Exclude a Team', value: 'team' }
	]);
	fieldEls.get('getActor-exclusion')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'actor', targets: [fieldEls.get('getActor-exclusionActor')] },
			{ case: 'team', targets: [fieldEls.get('getActor-exclusionTeamId')] }
		]);
	fieldEls.get('getActor')?.on?.('open', () => {
		const items = Data.createTeamItems!();
		fieldEls.get('getActor-teamId')?.loadItems?.(items);
		fieldEls.get('getActor-exclusionTeamId')?.loadItems?.(items);
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
