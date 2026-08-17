<template>
<WindowFrame id="setEvent" @confirm="onConfirm">
	<template #title><TitleBar>Set Event<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Operation</div><SelectBox id="setEvent-operation" v-model="form.operation" />
			<div class="text">Variable</div
			><CustomBox id="setEvent-variable" type="variable" filter="object" @input="onVariable" />
			<div class="text">Event</div
			><CustomBox id="setEvent-eventId" type="file" filter="event" @input="onEventId" />
			<div class="text">Choice Index</div
			><NumberVar id="setEvent-choiceIndex" min="0" max="255" v-model="form.choiceIndex" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetEventCommandSchema } from '@app/composables/commands/useSetEventCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { Local } from '@app/legacy/tools/localization.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useSetEventCommandSchema();

const onVariable = (value: unknown) => {
	form.variable = value;
};

const onEventId = (value: unknown) => {
	form.eventId = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = Local.createGetter!('command.setEvent');
	$('#setEvent-operation')?.loadItems?.([
		{ name: get('stop-propagation') || 'Stop Propagation', value: 'stop-propagation' },
		{ name: get('pause') || 'Pause and Save to Variable', value: 'pause' },
		{ name: get('continue') || 'Continue and Reset Variable', value: 'continue' },
		{ name: get('enable') || 'Enable Global Event', value: 'enable' },
		{ name: get('disable') || 'Disable Global Event', value: 'disable' },
		{ name: get('highest-priority') || 'Set to Highest Priority', value: 'highest-priority' },
		{ name: get('goto-choice-branch') || 'Go to Choice Branch', value: 'goto-choice-branch' }
	]);
	$('#setEvent-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['pause', 'continue'],
				targets: [$('#setEvent-variable')]
			},
			{
				case: ['enable', 'disable', 'highest-priority'],
				targets: [$('#setEvent-eventId')]
			},
			{
				case: 'goto-choice-branch',
				targets: [$('#setEvent-choiceIndex')]
			}
		]);
});

</script>
