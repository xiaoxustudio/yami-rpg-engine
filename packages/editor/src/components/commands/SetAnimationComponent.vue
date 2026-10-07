<template>
	<WindowFrame
		id="setAnimationComponent"
		:ref="registryRef(fieldEls, 'setAnimationComponent')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.setAnimationComponent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setAnimationComponent-actor.label') }}</div>
			<CustomBox
				id="setAnimationComponent-actor"
				:ref="registryRef(fieldEls, 'setAnimationComponent-actor')"
				v-tip="t('components.setAnimationComponent-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.setAnimationComponent-animationId.label') }}</div>
			<CustomBox
				id="setAnimationComponent-animationId"
				:ref="registryRef(fieldEls, 'setAnimationComponent-animationId')"
				v-tip="t('components.setAnimationComponent-animationId.tip')"
				v-focus
				type="file"
				filter="animation"
				v-model="form.animationId"
				@write="onAnimationIdWrite"
			/>
			<div class="text">{{ t('components.setAnimationComponent-motion.label') }}</div>
			<SelectBox
				:label="t('components.setAnimationComponent-motion.label')"
				id="setAnimationComponent-motion"
				v-tip="t('components.setAnimationComponent-motion.tip')"
				:ref="registryRef(fieldEls, 'setAnimationComponent-motion')"
				v-focus
				v-model="form.motion"
			/>
			<div class="text">{{ t('components.setAnimationComponent-operation.label') }}</div>
			<SelectBox
				:label="t('components.setAnimationComponent-operation.label')"
				id="setAnimationComponent-operation"
				v-tip="t('components.setAnimationComponent-operation.tip')"
				:ref="registryRef(fieldEls, 'setAnimationComponent-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setAnimationComponent-angle.label') }}</div>
			<CustomBox
				id="setAnimationComponent-angle"
				v-tip="t('components.setAnimationComponent-angle.tip')"
				:ref="registryRef(fieldEls, 'setAnimationComponent-angle')"
				type="angle"
				v-model="form.angle"
			/>
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
				:label="t('components.setAnimationComponent-priority.label')"
				id="setAnimationComponent-priority"
				v-tip="t('components.setAnimationComponent-priority.tip')"
				:ref="registryRef(fieldEls, 'setAnimationComponent-priority')"
				min="-100"
				max="100"
				v-model="priority"
			/>
			<div class="text">{{ t('components.setAnimationComponent-offsetY.label') }}</div>
			<NumberBox
				:label="t('components.setAnimationComponent-offsetY.label')"
				id="setAnimationComponent-offsetY"
				v-tip="t('components.setAnimationComponent-offsetY.tip')"
				:ref="registryRef(fieldEls, 'setAnimationComponent-offsetY')"
				min="-100"
				max="100"
				unit="px"
				v-model="offsetY"
			/>
			<div class="text">{{ t('components.setAnimationComponent-spriteId.label') }}</div>
			<SelectBox
				:label="t('components.setAnimationComponent-spriteId.label')"
				id="setAnimationComponent-spriteId"
				v-tip="t('components.setAnimationComponent-spriteId.tip')"
				:ref="registryRef(fieldEls, 'setAnimationComponent-spriteId')"
				v-focus
				v-model="form.spriteId"
			/>
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
			<SelectBox
				:label="t('components.setAnimationComponent-playMotion.label')"
				id="setAnimationComponent-playMotion"
				v-tip="t('components.setAnimationComponent-playMotion.tip')"
				:ref="registryRef(fieldEls, 'setAnimationComponent-playMotion')"
				v-focus
				v-model="form.playMotion"
			/>
			<div class="text">{{ t('components.setAnimationComponent-wait.label') }}</div>
			<SelectBox
				:label="t('components.setAnimationComponent-wait.label')"
				id="setAnimationComponent-wait"
				:ref="registryRef(fieldEls, 'setAnimationComponent-wait')"
				name="wait"
				v-model="form.wait"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

const fieldEls = createElementRegistry(composableEls);
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
import type { YamiElement } from '@app/types/element-api';

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
	const elMotion = fieldEls.get('setAnimationComponent-motion') as YamiElement;
	const elPlayMotion = fieldEls.get('setAnimationComponent-playMotion') as YamiElement;
	const elSpriteId = fieldEls.get('setAnimationComponent-spriteId') as YamiElement;
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
	useLocalizedOptions(
		'setAnimationComponent-operation',
		[
			'set-angle',
			'set-scale',
			'set-speed',
			'set-opacity',
			'set-priority',
			'set-offsetY',
			'set-sprite',
			'play-motion',
			'stop-motion'
		],
		(items) => fieldEls.get('setAnimationComponent-operation')?.loadItems?.(items),
		{
			'set-angle': 'command.setAnimationComponent.set-angle',
			'set-scale': 'command.setAnimationComponent.set-scale',
			'set-speed': 'command.setAnimationComponent.set-speed',
			'set-opacity': 'command.setAnimationComponent.set-opacity',
			'set-priority': 'command.setAnimationComponent.set-priority',
			'set-offsetY': 'command.setAnimationComponent.set-offsetY',
			'set-sprite': 'command.setAnimationComponent.set-sprite',
			'play-motion': 'command.setAnimationComponent.play-motion',
			'stop-motion': 'command.setAnimationComponent.stop-motion'
		}
	);
	fieldEls
		.get('setAnimationComponent-operation')
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
				targets: [
					fieldEls.get('setAnimationComponent-spriteId'),
					fieldEls.get('setAnimationComponent-image')
				]
			},
			{
				case: 'play-motion',
				targets: [
					fieldEls.get('setAnimationComponent-playMotion'),
					fieldEls.get('setAnimationComponent-wait')
				]
			}
		]);
	useLocalizedOptions('setAnimationComponent-wait', [true, false], (items) =>
		fieldEls.get('setAnimationComponent-wait')?.loadItems?.(items)
	);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
