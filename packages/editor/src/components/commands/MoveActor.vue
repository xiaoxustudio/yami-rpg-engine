<template>
<WindowFrame id="moveActor" @confirm="onConfirm">
	<template #title><TitleBar>Move Actor<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="moveActor-actor" type="actor" @input="onActor" /><div class="text">Mode</div><SelectBox id="moveActor-mode" v-model="form.mode" /><div class="text">Angle</div
			><NumberVar
				id="moveActor-angle"
				min="-360"
				max="360"
				decimals="4"
				unit="deg"
				v-model="form.angle"
			 /><div class="text">Destination</div
			><CustomBox id="moveActor-destination" type="position" @input="onDestination" /><div class="text">Wait</div
			><SelectBox id="moveActor-wait" name="wait" v-model="form.wait" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useMoveActorCommandSchema } from '@app/composables/commands/useMoveActorCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { createGetter } from '@app/i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useMoveActorCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onDestination = (value: unknown) => {
	form.destination = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.moveActor');
	$('#moveActor-mode')?.loadItems?.([
		{ name: get('mode.stop') || 'Stop', value: 'stop' },
		{ name: get('mode.keep') || 'Keep', value: 'keep' },
		{ name: get('mode.straight') || 'Straight', value: 'straight' },
		{ name: get('mode.navigate') || 'Navigate', value: 'navigate' },
		{ name: get('mode.navigate-bypass') || 'Navigate - Bypass Actors', value: 'navigate-bypass' },
		{ name: get('mode.teleport') || 'Teleport', value: 'teleport' }
	]);
	$('#moveActor-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'keep', targets: [$('#moveActor-angle')] },
			{
				case: ['straight', 'navigate', 'navigate-bypass'],
				targets: [$('#moveActor-destination'), $('#moveActor-wait')]
			},
			{ case: 'teleport', targets: [$('#moveActor-destination')] }
		]);
	$('#moveActor-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
});

</script>
