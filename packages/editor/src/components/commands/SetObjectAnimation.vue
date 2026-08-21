<template>
	<WindowFrame id="setObjectAnimation" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.setObjectAnimation.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box" id="setObjectAnimation-grid-box">
				<div class="text">Sort</div><SelectBox id="setObjectAnimation-sort" v-model="form.sort" />
				<div class="text">Actor</div><CustomBox id="setObjectAnimation-actor" type="actor" @input="onActor" />
				<div class="text">Trigger</div
				><CustomBox id="setObjectAnimation-trigger" type="trigger" @input="onTrigger" />
				<div class="text">Animation</div
				><CustomBox id="setObjectAnimation-animation" type="object" @input="onAnimation" />
				<div class="text">Operation</div><SelectBox id="setObjectAnimation-operation" v-model="form.operation" />
				<div class="text">Tint - Red</div
				><NumberBox id="setObjectAnimation-tint-0" min="-255" max="255" step="5" v-model="form['tint-0']" />
				<div class="text">Tint - Green</div
				><NumberBox id="setObjectAnimation-tint-1" min="-255" max="255" step="5" v-model="form['tint-1']" />
				<div class="text">Tint - Blue</div
				><NumberBox id="setObjectAnimation-tint-2" min="-255" max="255" step="5" v-model="form['tint-2']" />
				<div class="text">Tint - Grayscale</div
				><NumberBox id="setObjectAnimation-tint-3" min="0" max="255" step="5" v-model="form['tint-3']" />
				<div class="text">Opacity</div
				><NumberVar
					id="setObjectAnimation-opacity"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
					v-model="form.opacity"
				 />
				<div class="text">OffsetY</div
				><NumberVar
					id="setObjectAnimation-offsetY"
					min="-10000"
					max="10000"
					step="1"
					decimals="4"
					v-model="form.offsetY"
				 />
				<div class="text">Rotation</div
				><NumberVar
					id="setObjectAnimation-rotation"
					min="-10000"
					max="10000"
					step="1"
					decimals="4"
					v-model="form.rotation"
				 />
				<div class="text">Easing</div
				><SelectBox id="setObjectAnimation-easingId" name="easing" v-model="form.easingId" />
				<div class="text">Duration</div
				><NumberBox
					id="setObjectAnimation-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
					v-model="form.duration"
				 />
				<div class="text">Wait</div><SelectBox id="setObjectAnimation-wait" name="wait" v-model="form.wait" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetObjectAnimationCommandSchema } from '@app/composables/commands/useSetObjectAnimationCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetObjectAnimationCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onTrigger = (value: unknown) => {
	form.trigger = value;
};

const onAnimation = (value: unknown) => {
	form.animation = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setObjectAnimation-sort')?.loadItems?.([
		{ name: 'Only Actor Animation', value: 'actor' },
		{ name: 'All Animation Components', value: 'components' },
		{ name: 'Trigger Animation', value: 'trigger' },
		{ name: 'Scene Animation', value: 'animation' }
	]);
	$('#setObjectAnimation-sort')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['actor', 'components'],
				targets: [$('#setObjectAnimation-actor')]
			},
			{
				case: 'trigger',
				targets: [$('#setObjectAnimation-trigger')]
			},
			{
				case: 'animation',
				targets: [$('#setObjectAnimation-animation')]
			}
		]);
	$('#setObjectAnimation-operation')?.loadItems?.([
		{ name: 'Set Tint', value: 'set-tint' },
		{ name: 'Set RGB', value: 'set-rgb' },
		{ name: 'Set Gray', value: 'set-gray' },
		{ name: 'Set Opacity', value: 'set-opacity' },
		{ name: 'Set OffsetY', value: 'set-offsetY' },
		{ name: 'Set Rotation', value: 'set-rotation' }
	]);
	$('#setObjectAnimation-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'set-tint',
				targets: [
					$('#setObjectAnimation-tint-0'),
					$('#setObjectAnimation-tint-1'),
					$('#setObjectAnimation-tint-2'),
					$('#setObjectAnimation-tint-3')
				]
			},
			{
				case: 'set-rgb',
				targets: [
					$('#setObjectAnimation-tint-0'),
					$('#setObjectAnimation-tint-1'),
					$('#setObjectAnimation-tint-2')
				]
			},
			{
				case: 'set-gray',
				targets: [$('#setObjectAnimation-tint-3')]
			},
			{
				case: 'set-opacity',
				targets: [$('#setObjectAnimation-opacity')]
			},
			{
				case: 'set-offsetY',
				targets: [$('#setObjectAnimation-offsetY')]
			},
			{
				case: 'set-rotation',
				targets: [$('#setObjectAnimation-rotation')]
			}
		]);
	$('#setObjectAnimation-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#setObjectAnimation')?.on?.('open', () => {
		$('#setObjectAnimation-easingId')?.loadItems?.(Data.createEasingItems!());
	});
	$('#setObjectAnimation')?.on?.('closed', () => {
		clear($('#setObjectAnimation-easingId'));
	});
});

</script>
