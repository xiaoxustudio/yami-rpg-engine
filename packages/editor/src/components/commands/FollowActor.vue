<template>
<WindowFrame id="followActor" @confirm="onConfirm">
	<template #title><TitleBar>Follow Actor<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="followActor-actor" type="actor" @input="onActor" /><div class="text">Target</div><CustomBox id="followActor-target" type="actor" @input="onTarget" /><div class="text">Mode</div><SelectBox id="followActor-mode" v-model="form.mode" /><div class="text">Min Distance</div
			><NumberVar
				id="followActor-minDist"
				min="0"
				max="16"
				decimals="4"
				unit="tile"
				v-model="form.minDist"
			 /><div class="text">Max Distance</div
			><NumberVar
				id="followActor-maxDist"
				min="0"
				max="20"
				decimals="4"
				unit="tile"
				v-model="form.maxDist"
			 /><div class="text">Offset Ratio</div
			><NumberBox
				id="followActor-offset"
				min="-0.8"
				max="0.8"
				decimals="4"
				unit="r"
				v-model="form.offset"
			 /><div class="text">Vert Distance</div
			><NumberBox
				id="followActor-vertDist"
				min="0"
				max="4"
				decimals="4"
				unit="tile"
				v-model="form.vertDist"
			 /><div class="text">Buffer Distance</div
			><NumberBox
				id="followActor-bufferDist"
				min="0"
				max="4"
				decimals="4"
				unit="tile"
				v-model="form.bufferDist"
			 /><div class="text">Navigate</div><SelectBox id="followActor-navigate" v-model="form.navigate" /><div class="text">Bypass Actors</div><SelectBox id="followActor-bypass" v-model="form.bypass" /><div class="text">Once</div><SelectBox id="followActor-once" v-model="form.once" /><div class="text">Wait</div
			><SelectBox id="followActor-wait" name="wait" v-model="form.wait" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useFollowActorCommandSchema } from '@app/composables/commands/useFollowActorCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { createGetter } from '@app/i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useFollowActorCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onTarget = (value: unknown) => {
	form.target = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.followActor');
	$('#followActor-mode')?.loadItems?.([
		{ name: get('mode.circle') || 'Circle', value: 'circle' },
		{ name: get('mode.rectangle') || 'Rectangle', value: 'rectangle' }
	]);
	$('#followActor-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'circle', targets: [$('#followActor-offset')] },
			{ case: 'rectangle', targets: [$('#followActor-vertDist')] }
		]);
	$('#followActor-navigate')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#followActor-navigate')
		?.enableHiddenMode?.()
		?.relate?.([{ case: true, targets: [$('#followActor-bypass')] }]);
	$('#followActor-bypass')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#followActor-once')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#followActor-once')
		?.enableHiddenMode?.()
		?.relate?.([{ case: true, targets: [$('#followActor-wait')] }]);
	$('#followActor-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
});

</script>
