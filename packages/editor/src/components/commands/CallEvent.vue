<template>
<WindowFrame id="callEvent" @confirm="onConfirm">
	<template #title><TitleBar>{{ t('components.callEvent.title') }}<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Type</div
			><SelectBox id="callEvent-type" v-model="form.type" @write="onTypeWrite" /> <div class="text">Actor</div
			><CustomBox id="callEvent-actor" type="actor" @input="onActor" /> <div class="text">Skill</div
			><CustomBox id="callEvent-skill" type="skill" @input="onSkill" /> <div class="text">State</div
			><CustomBox id="callEvent-state" type="state" @input="onState" /> <div class="text">Equipment</div
			><CustomBox id="callEvent-equipment" type="equipment" @input="onEquipment" /> <div class="text">Item</div
			><CustomBox id="callEvent-item" type="item" @input="onItem" /> <div class="text">Light</div
			><CustomBox id="callEvent-light" type="light" @input="onLight" /> <div class="text">Element</div
			><CustomBox id="callEvent-element" type="element" @input="onElement" /> <div class="text">Event</div
			><CustomBox
				id="callEvent-eventId"
				type="file"
				filter="event"
				@write="onEventIdWrite"
				@input="onEventIdInput"
			/>
			<div class="text">Event</div><SelectBox id="callEvent-eventType" v-model="form.eventType" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCallEventCommandSchema } from '@app/composables/commands/useCallEventCommandSchema';
import { $ } from '@app/utils/dom';
import { createGetter } from '@app/i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save, typeWrite, eventIdWrite, eventIdInput, onWindowClosed } =
	useCallEventCommandSchema();

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

const onLight = (value: unknown) => {
	form.light = value;
};

const onElement = (value: unknown) => {
	form.element = value;
};

const onTypeWrite = (value: unknown) => {
	typeWrite({ value: value as string });
};

const onEventIdWrite = (value: unknown) => {
	eventIdWrite({ value: value as string });
};

const onEventIdInput = (value: unknown) => {
	eventIdInput({ value: value as string });
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.callEvent');
	$('#callEvent-type')?.loadItems?.([
		{ name: 'Global', value: 'global' },
		{ name: get('inherited') || 'Inherited', value: 'inherited' },
		{ name: get('scene') || 'Scene', value: 'scene' },
		{ name: 'Actor', value: 'actor' },
		{ name: 'Skill', value: 'skill' },
		{ name: 'State', value: 'state' },
		{ name: 'Equipment', value: 'equipment' },
		{ name: 'Item', value: 'item' },
		{ name: 'Light', value: 'light' },
		{ name: 'Element', value: 'element' }
	]);

	$('#callEvent-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'global', targets: [$('#callEvent-eventId')] },
			{ case: 'scene', targets: [$('#callEvent-eventType')] },
			{
				case: 'actor',
				targets: [$('#callEvent-actor'), $('#callEvent-eventType')]
			},
			{
				case: 'skill',
				targets: [$('#callEvent-skill'), $('#callEvent-eventType')]
			},
			{
				case: 'state',
				targets: [$('#callEvent-state'), $('#callEvent-eventType')]
			},
			{
				case: 'equipment',
				targets: [$('#callEvent-equipment'), $('#callEvent-eventType')]
			},
			{
				case: 'item',
				targets: [$('#callEvent-item'), $('#callEvent-eventType')]
			},
			{
				case: 'light',
				targets: [$('#callEvent-light'), $('#callEvent-eventType')]
			},
			{
				case: 'element',
				targets: [$('#callEvent-element'), $('#callEvent-eventType')]
			}
		]);

	$('#callEvent')?.on?.('closed', () => {
		onWindowClosed();
	});
});
</script>
