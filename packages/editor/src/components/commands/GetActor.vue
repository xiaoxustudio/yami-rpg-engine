<template>
<WindowFrame id="getActor" @confirm="onConfirm">
	<template #title><TitleBar>Get Actor<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Write to Variable</div
			><CustomBox
				id="getActor-variable"
				type="variable"
				filter="object"
			/><div class="text">Position</div
			><CustomBox id="getActor-position" type="position" /><div class="text">Area</div
			><SelectBox id="getActor-area" /><div class="text">Size</div
			><NumberVar
				id="getActor-size"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			/><div class="text">Radius</div
			><NumberVar
				id="getActor-radius"
				min="0"
				max="256"
				decimals="4"
				unit="tile"
			 /><div class="text">Selector</div
			><SelectBox id="getActor-selector" /><div class="text">Team</div
			><SelectVar id="getActor-teamId" /><div class="text">Condition</div
			><SelectBox id="getActor-condition" /><div class="text">Attribute</div
			><SelectBox id="getActor-attribute" /><div class="text">Attribute 2</div
			><SelectBox id="getActor-divisor" /><div class="text">Activation</div
			><SelectBox id="getActor-activation" /><div class="text">Exclusion</div
			><SelectBox id="getActor-exclusion" /><div class="text">Exclusion Actor</div
			><CustomBox
				id="getActor-exclusionActor"
				type="actor"
			/><div class="text">Exclusion Team</div
			><SelectVar id="getActor-exclusionTeamId" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted, reactive } from 'vue';
import { useGetActorCommandSchema } from '@app/composables/commands/useGetActorCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { createGetter } from '@app/i18n';
import { clear } from '@app/legacy/util/element-utils';
import { Data } from '@app/legacy/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { save } = useGetActorCommandSchema();

const form = reactive({
	area: 'square',
	size: 1,
	radius: 1,
	selector: 'enemy',
	teamId: { type: 'local', key: '' },
	condition: 'nearest',
	attribute: '',
	divisor: '',
	activation: 'active',
	exclusion: 'none',
	exclusionTeamId: { type: 'local', key: '' }
});

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.getActor');
	$('#getActor-area')?.loadItems?.([
		{ name: get('square') || 'Square', value: 'square' },
		{ name: get('circle') || 'Circle', value: 'circle' }
	]);
	$('#getActor-area')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'square', targets: [$('#getActor-size')] },
			{ case: 'circle', targets: [$('#getActor-radius')] }
		]);
	$('#getActor-selector')?.loadItems?.([
		{ name: 'Team Enemy', value: 'enemy' },
		{ name: 'Team Friend', value: 'friend' },
		{ name: 'Team Member', value: 'team' },
		{ name: 'Any', value: 'any' }
	]);
	$('#getActor-selector')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['enemy', 'friend', 'team'],
				targets: [$('#getActor-teamId')]
			}
		]);
	$('#getActor-condition')?.loadItems?.([
		{ name: get('condition.nearest') || 'Nearest', value: 'nearest' },
		{ name: get('condition.farthest') || 'Farthest', value: 'farthest' },
		{ name: get('condition.min-attribute-value') || 'Min Attribute Value', value: 'min-attribute-value' },
		{ name: get('condition.max-attribute-value') || 'Max Attribute Value', value: 'max-attribute-value' },
		{ name: get('condition.min-attribute-ratio') || 'Min Attribute Ratio', value: 'min-attribute-ratio' },
		{ name: get('condition.max-attribute-ratio') || 'Max Attribute Ratio', value: 'max-attribute-ratio' },
		{ name: get('condition.random') || 'Random', value: 'random' }
	]);
	$('#getActor-condition')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['min-attribute-value', 'max-attribute-value'],
				targets: [$('#getActor-attribute')]
			},
			{
				case: ['min-attribute-ratio', 'max-attribute-ratio'],
				targets: [$('#getActor-attribute'), $('#getActor-divisor')]
			}
		]);
	$('#getActor-activation')?.loadItems?.([
		{ name: get('active') || 'Active', value: 'active' },
		{ name: get('inactive') || 'Inactive', value: 'inactive' },
		{ name: get('either') || 'Either', value: 'either' }
	]);
	$('#getActor-exclusion')?.loadItems?.([
		{ name: 'None', value: 'none' },
		{ name: 'Exclude an Actor', value: 'actor' },
		{ name: 'Exclude a Team', value: 'team' }
	]);
	$('#getActor-exclusion')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'actor', targets: [$('#getActor-exclusionActor')] },
			{ case: 'team', targets: [$('#getActor-exclusionTeamId')] }
		]);
	$('#getActor')?.on?.('open', () => {
		const items = Data.createTeamItems!();
		$('#getActor-teamId')?.loadItems?.(items);
		$('#getActor-exclusionTeamId')?.loadItems?.(items);
	});
	$('#getActor')?.on?.('closed', () => {
		clear($('#getActor-teamId'));
		clear($('#getActor-exclusionTeamId'));
	});
});

</script>
