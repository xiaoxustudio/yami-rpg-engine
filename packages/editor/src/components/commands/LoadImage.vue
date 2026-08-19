<template>
	<WindowFrame id="loadImage" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.loadImage.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="loadImage-element" type="element" @input="onElement" />
				<div class="text">Type</div><SelectBox id="loadImage-type" v-model="form.type" /> <div class="text">Actor</div
				><CustomBox id="loadImage-actor" type="actor" @input="onActor" /> <div class="text">Skill</div
				><CustomBox id="loadImage-skill" type="skill" @input="onSkill" /> <div class="text">State</div
				><CustomBox id="loadImage-state" type="state" @input="onState" /> <div class="text">Equipment</div
				><CustomBox id="loadImage-equipment" type="equipment" @input="onEquipment" /> <div class="text">Item</div
				><CustomBox id="loadImage-item" type="item" @input="onItem" /> <div class="text">Shortcut Key</div
				><SelectVar id="loadImage-key" v-model="form.key" /> <div class="text">Base64 Coding</div
				><CustomBox id="loadImage-variable" type="variable" filter="string" @input="onVariable" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLoadImageCommandSchema } from '@app/composables/commands/useLoadImageCommandSchema';
import { $ } from '@app/utils/dom';
import { createGetter } from '@app/i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useLoadImageCommandSchema();

const onElement = (value: unknown) => {
	form.element = value;
};

const onActor = (value: unknown) => {
	form.actor = value;
};

const onSkill = (value: unknown) => {
	form.skill = value;
};

const onState = (value: unknown) => {
	form.state = value;
};

const onEquipment = (value: unknown) => {
	form.equipment = value;
};

const onItem = (value: unknown) => {
	form.item = value;
};

const onVariable = (value: unknown) => {
	form.variable = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.loadImage');
	$('#loadImage-type')?.loadItems?.([
		{ name: get('actor-portrait') || 'Actor Portrait', value: 'actor-portrait' },
		{ name: get('skill-icon') || 'Skill Icon', value: 'skill-icon' },
		{ name: get('state-icon') || 'State Icon', value: 'state-icon' },
		{ name: get('equipment-icon') || 'Equipment Icon', value: 'equipment-icon' },
		{ name: get('item-icon') || 'Item Icon', value: 'item-icon' },
		{ name: get('shortcut-icon') || 'Shortcut Icon', value: 'shortcut-icon' },
		{ name: get('base64') || 'Base64 Image', value: 'base64' }
	]);
	$('#loadImage-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'actor-portrait', targets: [$('#loadImage-actor')] },
			{ case: 'skill-icon', targets: [$('#loadImage-skill')] },
			{ case: 'state-icon', targets: [$('#loadImage-state')] },
			{
				case: 'equipment-icon',
				targets: [$('#loadImage-equipment')]
			},
			{ case: 'item-icon', targets: [$('#loadImage-item')] },
			{
				case: 'shortcut-icon',
				targets: [$('#loadImage-actor'), $('#loadImage-key')]
			},
			{ case: 'base64', targets: [$('#loadImage-variable')] }
		]);
});

</script>
