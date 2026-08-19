<template>
	<WindowFrame id="playAnimation" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.playAnimation.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Mode</div><SelectBox id="playAnimation-mode" v-model="form.mode" /> <div class="text">Position</div
				><CustomBox id="playAnimation-position" type="position" @input="onPosition" /> <div class="text">Actor</div
				><CustomBox id="playAnimation-actor" type="actor" @input="onActor" /> <div class="text">Animation</div
				><CustomBox
					id="playAnimation-animationId"
					type="file"
					filter="animation"
					@write="onWrite"
				 />
				<div class="text">Motion</div><SelectBox id="playAnimation-motion" v-model="form.motion" />
				<div class="text">Rotatable</div><SelectBox id="playAnimation-rotatable" v-model="form.rotatable" />
				<div class="text">Priority</div
				><NumberBox id="playAnimation-priority" min="-100" max="100" v-model="form.priority" />
				<div class="text">Offset Y</div
				><NumberVar
					id="playAnimation-offsetY"
					min="-1000000000"
					max="1000000000"
					unit="px"
					v-model="form.offsetY"
				 />
				<div class="text">Angle</div
				><NumberVar
					id="playAnimation-angle"
					min="-360"
					max="360"
					decimals="4"
					unit="deg"
					v-model="form.angle"
				 />
				<div class="text">Speed</div
				><NumberVar
					id="playAnimation-speed"
					min="0.1"
					max="10"
					step="0.1"
					decimals="4"
					v-model="form.speed"
				 />
				<div class="text">Wait</div><SelectBox id="playAnimation-wait" name="wait" v-model="form.wait" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlayAnimationCommandSchema } from '@app/composables/commands/usePlayAnimationCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { read } from '@app/legacy/util/element-utils';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save, writeHandler } = usePlayAnimationCommandSchema();

const onPosition = (value: unknown) => {
	form.position = value;
};

const onActor = (value: unknown) => {
	form.actor = value;
};

const onWrite = (value: unknown) => {
	writeHandler({ value: value as string });
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#playAnimation-mode')?.loadItems?.([
		{ name: 'Position', value: 'position' },
		{ name: 'Actor', value: 'actor' }
	]);
	$('#playAnimation-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'position', targets: [$('#playAnimation-position')] },
			{ case: 'actor', targets: [$('#playAnimation-actor')] }
		]);
	$('#playAnimation-rotatable')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#playAnimation-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	const animationId = read($('#playAnimation-animationId'));
	if (animationId) writeHandler({ value: animationId });
});

</script>
