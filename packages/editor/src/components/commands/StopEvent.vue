<template>
	<WindowFrame id="stopEvent" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.stopEvent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
		<div class="text">Type</div>
		<SelectBox id="stopEvent-type" v-focus v-model="form.type" @write="onTypeWrite" />
		<div class="text">Actor</div>
		<CustomBox id="stopEvent-actor" type="actor" v-model="form.actor" />
		<div class="text">Skill</div>
		<CustomBox id="stopEvent-skill" type="skill" v-model="form.skill" />
		<div class="text">State</div>
		<CustomBox id="stopEvent-state" type="state" v-model="form.state" />
		<div class="text">Equipment</div>
		<CustomBox id="stopEvent-equipment" type="equipment" v-model="form.equipment" />
		<div class="text">Item</div>
		<CustomBox id="stopEvent-item" type="item" v-model="form.item" />
		<div class="text">Light</div>
		<CustomBox id="stopEvent-light" type="light" v-model="form.light" />
		<div class="text">Element</div>
		<CustomBox id="stopEvent-element" type="element" v-model="form.element" />
		<div class="text">Event</div>
		<CustomBox
			id="stopEvent-eventId"
			v-focus
			type="file"
			filter="event"
			v-model="form.eventId"
		/>
			<div class="text">Event</div>
			<SelectBox id="stopEvent-eventType" v-focus v-model="form.eventType" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStopEventCommandSchema } from '@app/composables/commands/useStopEventCommandSchema';
import { $ } from '@app/utils/dom';
import { write } from '@app/utils/element-utils';
import { EventEditor } from '@app/commands/event-editor.ts';
import { Enum } from '@app/enum/enum-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useStopEventCommandSchema();

const onTypeWrite = (value: unknown) => {
	const type = value as string;
	if (type === 'current') {
		return;
	}
	const source = EventEditor.types?.[type] ?? EventEditor.types?.all;
	if (!source) {
		return;
	}
	const elEventType = $('#stopEvent-eventType');
	const eventTypes = Enum.getMergedItems!(source, type + '-event');
	elEventType?.loadItems?.(eventTypes);
	elEventType?.createTooltip?.();
	write(elEventType, eventTypes[0].value);
	form.eventType = eventTypes[0].value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#stopEvent-type')?.loadItems?.([
		{ name: t('command.stopEvent.current') || 'Current', value: 'current' },
		{ name: 'Global', value: 'global' },
		{ name: t('command.stopEvent.scene') || 'Scene', value: 'scene' },
		{ name: 'Actor', value: 'actor' },
		{ name: 'Skill', value: 'skill' },
		{ name: 'State', value: 'state' },
		{ name: 'Equipment', value: 'equipment' },
		{ name: 'Item', value: 'item' },
		{ name: 'Light', value: 'light' },
		{ name: 'Element', value: 'element' }
	]);
	$('#stopEvent-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'global', targets: [$('#stopEvent-eventId')] },
			{ case: 'scene', targets: [$('#stopEvent-eventType')] },
			{
				case: 'actor',
				targets: [$('#stopEvent-actor'), $('#stopEvent-eventType')]
			},
			{
				case: 'skill',
				targets: [$('#stopEvent-skill'), $('#stopEvent-eventType')]
			},
			{
				case: 'state',
				targets: [$('#stopEvent-state'), $('#stopEvent-eventType')]
			},
			{
				case: 'equipment',
				targets: [$('#stopEvent-equipment'), $('#stopEvent-eventType')]
			},
			{
				case: 'item',
				targets: [$('#stopEvent-item'), $('#stopEvent-eventType')]
			},
			{
				case: 'light',
				targets: [$('#stopEvent-light'), $('#stopEvent-eventType')]
			},
			{
				case: 'element',
				targets: [$('#stopEvent-element'), $('#stopEvent-eventType')]
			}
		]);
});
</script>
