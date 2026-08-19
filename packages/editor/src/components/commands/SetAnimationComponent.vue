<template>
<WindowFrame id="setAnimationComponent" @confirm="onConfirm">
	<template #title><TitleBar>{{ t('components.setAnimationComponent.title') }}<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div
			><CustomBox id="setAnimationComponent-actor" type="actor" @input="onActor" /><div class="text">Animation</div
			><CustomBox
				id="setAnimationComponent-animationId"
				type="file"
				filter="animation"
				@input="onAnimationId"
				@write="onAnimationIdWrite"
			 /><div class="text">Motion</div><SelectBox id="setAnimationComponent-motion" v-model="form.motion" /><div class="text">Operation</div><SelectBox id="setAnimationComponent-operation" v-model="form.operation" /><div class="text">Angle</div
			><CustomBox id="setAnimationComponent-angle" type="angle" @input="onAngle" /><div class="text">Scale</div
			><NumberVar
				id="setAnimationComponent-scale"
				min="0"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.scale"
			 /><div class="text">Speed</div
			><NumberVar
				id="setAnimationComponent-speed"
				min="0"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.speed"
			 /><div class="text">Opacity</div
			><NumberVar
				id="setAnimationComponent-opacity"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
				v-model="form.opacity"
			 /><div class="text">Priority</div
			><NumberBox id="setAnimationComponent-priority" min="-100" max="100" v-model="form.priority" /><div class="text">Offset Y</div
			><NumberBox
				id="setAnimationComponent-offsetY"
				min="-100"
				max="100"
				unit="px"
				v-model="form.offsetY"
			 /><div class="text">Sprite Name</div><SelectBox id="setAnimationComponent-spriteId" v-model="form.spriteId" /><div class="text">Image</div
			><CustomBox id="setAnimationComponent-image" type="file" filter="image" @input="onImage" /><div class="text">Play Motion</div><SelectBox id="setAnimationComponent-playMotion" v-model="form.playMotion" /><div class="text">Wait</div><SelectBox id="setAnimationComponent-wait" name="wait" v-model="form.wait" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetAnimationComponentCommandSchema } from '@app/composables/commands/useSetAnimationComponentCommandSchema';
import { $ } from '@app/utils/dom';
import { read } from '@app/utils/element-utils';
import { createGetter } from '@app/i18n';
import { Animation } from '@app/legacy/animation/animation-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetAnimationComponentCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onAnimationId = (value: unknown) => {
	form.animationId = value;
};

const onAnimationIdWrite = (value: unknown) => {
	const animationId = value as string;
	const elMotion = $('#setAnimationComponent-motion');
	const elPlayMotion = $('#setAnimationComponent-playMotion');
	const elSpriteId = $('#setAnimationComponent-spriteId');
	const prevMotion = read(elMotion) || form.motion || '';
	const prevSprite = read(elSpriteId) || form.spriteId || '';
	const motionItems = Animation.getMotionListItems!(animationId);
	const spriteItems = Animation.getSpriteListItems!(animationId);
	elMotion?.loadItems?.(motionItems);
	elPlayMotion?.loadItems?.(motionItems);
	elSpriteId?.loadItems?.(spriteItems);
	elMotion?.write2?.(prevMotion);
	elPlayMotion?.write2?.(prevMotion);
	elSpriteId?.write2?.(prevSprite);
	form.motion = prevMotion;
	form.playMotion = prevMotion;
	form.spriteId = prevSprite;
};

const onAngle = (value: unknown) => {
	form.angle = value;
};

const onImage = (value: unknown) => {
	form.image = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.setAnimationComponent');
	$('#setAnimationComponent-operation')?.loadItems?.([
		{ name: get('set-angle') || 'Set Angle', value: 'set-angle' },
		{ name: get('set-scale') || 'Set Scale', value: 'set-scale' },
		{ name: get('set-speed') || 'Set Speed', value: 'set-speed' },
		{ name: get('set-opacity') || 'Set Opacity', value: 'set-opacity' },
		{ name: get('set-priority') || 'Set Priority', value: 'set-priority' },
		{ name: get('set-offsetY') || 'Set Offset Y', value: 'set-offsetY' },
		{ name: get('set-sprite') || 'Set Sprite', value: 'set-sprite' },
		{ name: get('play-motion') || 'Play Motion', value: 'play-motion' },
		{ name: get('stop-motion') || 'Stop Motion', value: 'stop-motion' }
	]);
	$('#setAnimationComponent-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'set-angle',
				targets: [$('#setAnimationComponent-angle')]
			},
			{
				case: 'set-scale',
				targets: [$('#setAnimationComponent-scale')]
			},
			{
				case: 'set-speed',
				targets: [$('#setAnimationComponent-speed')]
			},
			{
				case: 'set-opacity',
				targets: [$('#setAnimationComponent-opacity')]
			},
			{
				case: 'set-priority',
				targets: [$('#setAnimationComponent-priority')]
			},
			{
				case: 'set-offsetY',
				targets: [$('#setAnimationComponent-offsetY')]
			},
			{
				case: 'set-sprite',
				targets: [
					$('#setAnimationComponent-spriteId'),
					$('#setAnimationComponent-image')
				]
			},
			{
				case: 'play-motion',
				targets: [
					$('#setAnimationComponent-playMotion'),
					$('#setAnimationComponent-wait')
				]
			}
		]);
	$('#setAnimationComponent-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
});

</script>
