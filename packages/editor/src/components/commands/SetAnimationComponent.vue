<template>
	<WindowFrame id="setAnimationComponent" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setAnimationComponent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="setAnimationComponent-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Animation</div>
			<CustomBox
				id="setAnimationComponent-animationId"
				v-focus
				type="file"
				filter="animation"
				v-model="form.animationId"
				@write="onAnimationIdWrite"
			/>
			<div class="text">Motion</div>
			<SelectBox id="setAnimationComponent-motion" v-focus v-model="form.motion" />
			<div class="text">Operation</div>
			<SelectBox id="setAnimationComponent-operation" v-model="form.operation" />
			<div class="text">Angle</div>
			<CustomBox id="setAnimationComponent-angle" type="angle" v-model="form.angle" />
			<div class="text">Scale</div>
			<NumberVar
				id="setAnimationComponent-scale"
				min="0"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.scale"
			/>
			<div class="text">Speed</div>
			<NumberVar
				id="setAnimationComponent-speed"
				min="0"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.speed"
			/>
			<div class="text">Opacity</div>
			<NumberVar
				id="setAnimationComponent-opacity"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
				v-model="form.opacity"
			/>
			<div class="text">Priority</div>
			<NumberBox
				id="setAnimationComponent-priority"
				min="-100"
				max="100"
				v-model="priority"
			/>
			<div class="text">Offset Y</div>
			<NumberBox
				id="setAnimationComponent-offsetY"
				min="-100"
				max="100"
				unit="px"
				v-model="offsetY"
			/>
			<div class="text">Sprite Name</div>
			<SelectBox id="setAnimationComponent-spriteId" v-focus v-model="form.spriteId" />
			<div class="text">Image</div>
			<CustomBox
				id="setAnimationComponent-image"
				type="file"
				filter="image"
				v-model="form.image"
			/>
			<div class="text">Play Motion</div>
			<SelectBox id="setAnimationComponent-playMotion" v-focus v-model="form.playMotion" />
			<div class="text">Wait</div>
			<SelectBox id="setAnimationComponent-wait" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetAnimationComponentCommandSchema } from '@app/composables/commands/useSetAnimationComponentCommandSchema';
import { $ } from '@app/utils/dom';
import { read } from '@app/utils/element-utils';
import { Animation } from '@app/animation/animation-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetAnimationComponentCommandSchema();

const priority = computed({
	get: () => form.priority as number | string,
	set: (value) => {
		form.priority = value;
	}
});

const offsetY = computed({
	get: () => form.offsetY as number | string,
	set: (value) => {
		form.offsetY = value;
	}
});

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

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setAnimationComponent-operation')?.loadItems?.([
		{ name: t('command.setAnimationComponent.set-angle') || 'Set Angle', value: 'set-angle' },
		{ name: t('command.setAnimationComponent.set-scale') || 'Set Scale', value: 'set-scale' },
		{ name: t('command.setAnimationComponent.set-speed') || 'Set Speed', value: 'set-speed' },
		{
			name: t('command.setAnimationComponent.set-opacity') || 'Set Opacity',
			value: 'set-opacity'
		},
		{
			name: t('command.setAnimationComponent.set-priority') || 'Set Priority',
			value: 'set-priority'
		},
		{
			name: t('command.setAnimationComponent.set-offsetY') || 'Set Offset Y',
			value: 'set-offsetY'
		},
		{ name: t('command.setAnimationComponent.set-sprite') || 'Set Sprite', value: 'set-sprite' },
		{
			name: t('command.setAnimationComponent.play-motion') || 'Play Motion',
			value: 'play-motion'
		},
		{
			name: t('command.setAnimationComponent.stop-motion') || 'Stop Motion',
			value: 'stop-motion'
		}
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
				targets: [$('#setAnimationComponent-spriteId'), $('#setAnimationComponent-image')]
			},
			{
				case: 'play-motion',
				targets: [$('#setAnimationComponent-playMotion'), $('#setAnimationComponent-wait')]
			}
		]);
	$('#setAnimationComponent-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setAnimationComponent {
	width: 324px;
	height: 218px;
}

#setAnimationComponent-confirm {
	right: 108px;
	bottom: 10px;
}

#setAnimationComponent-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
