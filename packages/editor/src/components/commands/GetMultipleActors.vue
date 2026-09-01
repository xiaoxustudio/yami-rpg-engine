<template>
	<WindowFrame id="getMultipleActors" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.getMultipleActors.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Write to List</div>
			<CustomBox
				id="getMultipleActors-variable"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
			<div class="text">Position</div>
			<CustomBox id="getMultipleActors-position" type="position" v-model="form.position" />
			<div class="text">Area</div>
			<SelectBox id="getMultipleActors-area" v-model="form.area" />
			<div class="text">Width</div>
			<NumberVar
				id="getMultipleActors-width"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.width"
			/>
			<div class="text">Height</div>
			<NumberVar
				id="getMultipleActors-height"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.height"
			/>
			<div class="text">Radius</div>
			<NumberVar
				id="getMultipleActors-radius"
				min="0"
				max="256"
				decimals="4"
				unit="tile"
				v-model="form.radius"
			/>
			<div class="text">Selector</div>
			<SelectBox id="getMultipleActors-selector" v-model="form.selector" />
			<div class="text">Team</div>
			<SelectVar id="getMultipleActors-teamId" v-model="form.teamId" />
			<div class="text">Activation</div>
			<SelectBox id="getMultipleActors-activation" v-model="form.activation" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGetMultipleActorsCommandSchema } from '@app/composables/commands/useGetMultipleActorsCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useGetMultipleActorsCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#getMultipleActors-area')?.loadItems?.([
		{ name: t('command.getMultipleActors.rectangle') || 'Rectangle', value: 'rectangle' },
		{ name: t('command.getMultipleActors.circle') || 'Circle', value: 'circle' }
	]);
	$('#getMultipleActors-area')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'rectangle',
				targets: [$('#getMultipleActors-width'), $('#getMultipleActors-height')]
			},
			{ case: 'circle', targets: [$('#getMultipleActors-radius')] }
		]);
	$('#getMultipleActors-selector')?.loadItems?.([
		{ name: 'Team Enemy', value: 'enemy' },
		{ name: 'Team Friend', value: 'friend' },
		{ name: 'Team Member', value: 'team' },
		{ name: 'Any', value: 'any' }
	]);
	$('#getMultipleActors-selector')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['enemy', 'friend', 'team'],
				targets: [$('#getMultipleActors-teamId')]
			}
		]);
	$('#getMultipleActors-activation')?.loadItems?.([
		{ name: t('command.getMultipleActors.active') || 'Active', value: 'active' },
		{ name: t('command.getMultipleActors.inactive') || 'Inactive', value: 'inactive' },
		{ name: t('command.getMultipleActors.either') || 'Either', value: 'either' }
	]);
	$('#getMultipleActors')?.on?.('open', function (event: Event) {
		const items = Data.createTeamItems!();
		$('#getMultipleActors-teamId')?.loadItems?.(items);
	});
	$('#getMultipleActors')?.on?.('closed', function (event: Event) {
		clear($('#getMultipleActors-teamId'));
	});
});
</script>
