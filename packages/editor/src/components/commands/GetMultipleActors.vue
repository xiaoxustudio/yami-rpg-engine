<template>
<WindowFrame id="getMultipleActors" @confirm="onConfirm">
	<template #title><TitleBar>{{ t('components.getMultipleActors.title') }}<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Write to List</div
			><CustomBox
				id="getMultipleActors-variable"
				type="variable"
				filter="object"
				@input="onVariable"
			 /><div class="text">Position</div
			><CustomBox id="getMultipleActors-position" type="position" @input="onPosition" /><div class="text">Area</div><SelectBox id="getMultipleActors-area" v-model="form.area" @write="onArea" /><div class="text">Width</div
			><NumberVar
				id="getMultipleActors-width"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.width"
			 /><div class="text">Height</div
			><NumberVar
				id="getMultipleActors-height"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.height"
			 /><div class="text">Radius</div
			><NumberVar
				id="getMultipleActors-radius"
				min="0"
				max="256"
				decimals="4"
				unit="tile"
				v-model="form.radius"
			 /><div class="text">Selector</div><SelectBox id="getMultipleActors-selector" v-model="form.selector" @write="onSelector" /><div class="text">Team</div><SelectVar id="getMultipleActors-teamId" v-model="form.teamId" /><div class="text">Activation</div><SelectBox id="getMultipleActors-activation" v-model="form.activation" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGetMultipleActorsCommandSchema } from '@app/composables/commands/useGetMultipleActorsCommandSchema';
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

const { t } = useI18n();

const { form, save } = useGetMultipleActorsCommandSchema();

const onVariable = (value: unknown) => {
	form.variable = value;
};

const onPosition = (value: unknown) => {
	form.position = value;
};

const onArea = (value: unknown) => {
	form.area = value as string;
};

const onSelector = (value: unknown) => {
	form.selector = value as string;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.getMultipleActors');
	$('#getMultipleActors-area')?.loadItems?.([
		{ name: get('rectangle') || 'Rectangle', value: 'rectangle' },
		{ name: get('circle') || 'Circle', value: 'circle' }
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
		{ name: get('active') || 'Active', value: 'active' },
		{ name: get('inactive') || 'Inactive', value: 'inactive' },
		{ name: get('either') || 'Either', value: 'either' }
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
