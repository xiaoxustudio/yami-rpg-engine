<template>
	<WindowFrame id="setAnimationComponent" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setAnimationComponent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setAnimationComponent-actor.label') }}</div>
			<CustomBox id="setAnimationComponent-actor"
				v-tip="t('components.setAnimationComponent-actor.tip')" v-focus type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.setAnimationComponent-animationId.label') }}</div>
			<CustomBox
				id="setAnimationComponent-animationId"
				v-tip="t('components.setAnimationComponent-animationId.tip')"
				v-focus
				type="file"
				filter="animation"
				v-model="form.animationId"
				@write="onAnimationIdWrite"
			/>
			<div class="text">{{ t('components.setAnimationComponent-motion.label') }}</div>
			<SelectBox id="setAnimationComponent-motion"
				v-tip="t('components.setAnimationComponent-motion.tip')"
				:ref="registryRef(fieldEls, 'setAnimationComponent-motion')" v-focus v-model="form.motion" />
			<div class="text">{{ t('components.setAnimationComponent-operation.label') }}</div>
			<SelectBox id="setAnimationComponent-operation"
				v-tip="t('components.setAnimationComponent-operation.tip')"
				:ref="registryRef(fieldEls, 'setAnimationComponent-operation')" v-model="form.operation" />
			<div class="text">{{ t('components.setAnimationComponent-angle.label') }}</div>
			<CustomBox id="setAnimationComponent-angle"
				v-tip="t('components.setAnimationComponent-angle.tip')"
				:ref="registryRef(fieldEls, 'setAnimationComponent-angle')" type="angle" v-model="form.angle" />
			<div class="text">{{ t('components.setAnimationComponent-scale.label') }}</div>
			<NumberVar
				id="setAnimationComponent-scale"
				v-tip="t('components.setAnimationComponent-scale.tip')"
				:ref="registryRef(fieldEls, 'setAnimationComponent-scale')"
				min="0"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.scale"
			/>
			<div class="text">{{ t('components.setAnimationComponent-speed.label') }}</div>
			<NumberVar
				id="setAnimationComponent-speed"
				v-tip="t('components.setAnimationComponent-speed.tip')"
				:ref="registryRef(fieldEls, 'setAnimationComponent-speed')"
				min="0"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.speed"
			/>
			<div class="text">{{ t('components.setAnimationComponent-opacity.label') }}</div>
			<NumberVar
				id="setAnimationComponent-opacity"
				v-tip="t('components.setAnimationComponent-opacity.tip')"
				:ref="registryRef(fieldEls, 'setAnimationComponent-opacity')"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
				v-model="form.opacity"
			/>
			<div class="text">{{ t('components.setAnimationComponent-priority.label') }}</div>
			<NumberBox
				id="setAnimationComponent-priority"
				v-tip="t('components.setAnimationComponent-priority.tip')"
				:ref="registryRef(fieldEls, 'setAnimationComponent-priority')"
				min="-100"
				max="100"
				v-model="priority"
			/>
			<div class="text">{{ t('components.setAnimationComponent-offsetY.label') }}</div>
			<NumberBox
				id="setAnimationComponent-offsetY"
				v-tip="t('components.setAnimationComponent-offsetY.tip')"
				:ref="registryRef(fieldEls, 'setAnimationComponent-offsetY')"
				min="-100"
				max="100"
				unit="px"
				v-model="offsetY"
			/>
			<div class="text">{{ t('components.setAnimationComponent-spriteId.label') }}</div>
			<SelectBox id="setAnimationComponent-spriteId"
				v-tip="t('components.setAnimationComponent-spriteId.tip')"
				:ref="registryRef(fieldEls, 'setAnimationComponent-spriteId')" v-focus v-model="form.spriteId" />
			<div class="text">{{ t('components.setAnimationComponent-image.label') }}</div>
			<CustomBox
				id="setAnimationComponent-image"
				v-tip="t('components.setAnimationComponent-image.tip')"
				:ref="registryRef(fieldEls, 'setAnimationComponent-image')"
				type="file"
				filter="image"
				v-model="form.image"
			/>
			<div class="text">{{ t('components.setAnimationComponent-playMotion.label') }}</div>
			<SelectBox id="setAnimationComponent-playMotion"
				v-tip="t('components.setAnimationComponent-playMotion.tip')"
				:ref="registryRef(fieldEls, 'setAnimationComponent-playMotion')" v-focus v-model="form.playMotion" />
			<div class="text">{{ t('components.setAnimationComponent-wait.label') }}</div>
			<SelectBox id="setAnimationComponent-wait"
				:ref="registryRef(fieldEls, 'setAnimationComponent-wait')" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetAnimationComponentCommandSchema } from '@app/composables/commands/useSetAnimationComponentCommandSchema';
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
	const elMotion = fieldEls.get('setAnimationComponent-motion') as HTMLElement;
	const elPlayMotion = fieldEls.get('setAnimationComponent-playMotion') as HTMLElement;
	const elSpriteId = fieldEls.get('setAnimationComponent-spriteId') as HTMLElement;
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
	fieldEls.get('setAnimationComponent-operation')?.loadItems?.([
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
	fieldEls.get('setAnimationComponent-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'set-angle',
				targets: [fieldEls.get('setAnimationComponent-angle')]
			},
			{
				case: 'set-scale',
				targets: [fieldEls.get('setAnimationComponent-scale')]
			},
			{
				case: 'set-speed',
				targets: [fieldEls.get('setAnimationComponent-speed')]
			},
			{
				case: 'set-opacity',
				targets: [fieldEls.get('setAnimationComponent-opacity')]
			},
			{
				case: 'set-priority',
				targets: [fieldEls.get('setAnimationComponent-priority')]
			},
			{
				case: 'set-offsetY',
				targets: [fieldEls.get('setAnimationComponent-offsetY')]
			},
			{
				case: 'set-sprite',
				targets: [fieldEls.get('setAnimationComponent-spriteId'), fieldEls.get('setAnimationComponent-image')]
			},
			{
				case: 'play-motion',
				targets: [fieldEls.get('setAnimationComponent-playMotion'), fieldEls.get('setAnimationComponent-wait')]
			}
		]);
	fieldEls.get('setAnimationComponent-wait')?.loadItems?.([
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
