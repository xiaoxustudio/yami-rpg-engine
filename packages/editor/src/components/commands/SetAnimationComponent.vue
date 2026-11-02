<template>
	<WindowFrame
		id="setAnimationComponent"
		:ref="controlRef('setAnimationComponent')"
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
				:ref="controlRef('setAnimationComponent-actor')"
				v-tip="t('components.setAnimationComponent-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.setAnimationComponent-animationId.label') }}</div>
			<CustomBox
				id="setAnimationComponent-animationId"
				:ref="controlRef('setAnimationComponent-animationId')"
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
				:ref="controlRef('setAnimationComponent-motion')"
				v-focus
				v-model="form.motion"
			/>
			<div class="text">{{ t('components.setAnimationComponent-operation.label') }}</div>
			<SelectBox
				:label="t('components.setAnimationComponent-operation.label')"
				id="setAnimationComponent-operation"
				v-tip="t('components.setAnimationComponent-operation.tip')"
				:ref="controlRef('setAnimationComponent-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.setAnimationComponent-angle.label') }}</div>
			<CustomBox
				id="setAnimationComponent-angle"
				v-tip="t('components.setAnimationComponent-angle.tip')"
				:ref="controlRef('setAnimationComponent-angle')"
				type="angle"
				v-model="form.angle"
			/>
			<div class="text">{{ t('components.setAnimationComponent-scale.label') }}</div>
			<NumberVar
				id="setAnimationComponent-scale"
				v-tip="t('components.setAnimationComponent-scale.tip')"
				:ref="controlRef('setAnimationComponent-scale')"
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
				:ref="controlRef('setAnimationComponent-speed')"
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
				:ref="controlRef('setAnimationComponent-opacity')"
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
				:ref="controlRef('setAnimationComponent-priority')"
				min="-100"
				max="100"
				v-model="priority"
			/>
			<div class="text">{{ t('components.setAnimationComponent-offsetY.label') }}</div>
			<NumberBox
				:label="t('components.setAnimationComponent-offsetY.label')"
				id="setAnimationComponent-offsetY"
				v-tip="t('components.setAnimationComponent-offsetY.tip')"
				:ref="controlRef('setAnimationComponent-offsetY')"
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
				:ref="controlRef('setAnimationComponent-spriteId')"
				v-focus
				v-model="form.spriteId"
			/>
			<div class="text">{{ t('components.setAnimationComponent-image.label') }}</div>
			<CustomBox
				id="setAnimationComponent-image"
				v-tip="t('components.setAnimationComponent-image.tip')"
				:ref="controlRef('setAnimationComponent-image')"
				type="file"
				filter="image"
				v-model="form.image"
			/>
			<div class="text">{{ t('components.setAnimationComponent-playMotion.label') }}</div>
			<SelectBox
				:label="t('components.setAnimationComponent-playMotion.label')"
				id="setAnimationComponent-playMotion"
				v-tip="t('components.setAnimationComponent-playMotion.tip')"
				:ref="controlRef('setAnimationComponent-playMotion')"
				v-focus
				v-model="form.playMotion"
			/>
			<div class="text">{{ t('components.setAnimationComponent-wait.label') }}</div>
			<SelectBox
				:label="t('components.setAnimationComponent-wait.label')"
				id="setAnimationComponent-wait"
				:ref="controlRef('setAnimationComponent-wait')"
				name="wait"
				v-model="form.wait"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetAnimationComponentCommandSchema } from '@app/composables/commands/useSetAnimationComponentCommandSchema';
import { Animation } from '@app/animation/animation-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';
import {
	provideSetAnimationComponentBridge,
	resetSetAnimationComponentBridge,
	type SetAnimationComponentBridge
} from '@app/composables/set-animation-component-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'setAnimationComponent'
	| 'setAnimationComponent-actor'
	| 'setAnimationComponent-angle'
	| 'setAnimationComponent-animationId'
	| 'setAnimationComponent-image'
	| 'setAnimationComponent-motion'
	| 'setAnimationComponent-offsetY'
	| 'setAnimationComponent-opacity'
	| 'setAnimationComponent-operation'
	| 'setAnimationComponent-playMotion'
	| 'setAnimationComponent-priority'
	| 'setAnimationComponent-scale'
	| 'setAnimationComponent-speed'
	| 'setAnimationComponent-spriteId'
	| 'setAnimationComponent-wait';

const { controls, controlRef } = useControlRefs<Id>();

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
	const motionBox = controls['setAnimationComponent-motion'];
	const playMotionBox = controls['setAnimationComponent-playMotion'];
	const spriteBox = controls['setAnimationComponent-spriteId'];
	const prevMotion = (motionBox?.read?.() as string) || form.motion || '';
	const prevSprite = (spriteBox?.read?.() as string) || form.spriteId || '';
	const motionItems = Animation.getMotionListItems!(animationId);
	// 这个助手在 animation-window 里的返回类型还是 unknown（与 getMotionListItems 不一致）
	const spriteItems = Animation.getSpriteListItems!(animationId) as unknown[];
	motionBox?.loadItems?.(motionItems);
	playMotionBox?.loadItems?.(motionItems);
	spriteBox?.loadItems?.(spriteItems);
	// 只有「原来就有选中值」才回写：`write2` 在新列表里找不到旧值时会把第一项当默认值写进去，
	// 换动画时那就变成了替用户选一个 —— 之前的选中值为空时应当保持为空。
	if (prevMotion !== '') {
		motionBox?.write2?.(prevMotion);
		playMotionBox?.write2?.(prevMotion);
	}
	if (prevSprite !== '') {
		spriteBox?.write2?.(prevSprite);
	}
	form.motion = prevMotion;
	form.playMotion = prevMotion;
	form.spriteId = prevSprite;
};

/** 控件级能力：schema 载入表单时要按动画 id 换候选项，但 schema 不该知道控件 id。 */
const bridgeApi: SetAnimationComponentBridge = {
	loadItems: (motion, playMotion, sprite) => {
		controls['setAnimationComponent-motion']?.loadItems?.(motion);
		controls['setAnimationComponent-playMotion']?.loadItems?.(playMotion);
		controls['setAnimationComponent-spriteId']?.loadItems?.(sprite);
	}
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	provideSetAnimationComponentBridge(bridgeApi);
	onUnmounted(() => resetSetAnimationComponentBridge(bridgeApi));
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
		(items) => controls['setAnimationComponent-operation']?.loadItems?.(items),
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
	controls['setAnimationComponent-operation']?.enableHiddenMode?.();
	controls['setAnimationComponent-operation']?.relate?.([
		{
			case: 'set-angle',
			targets: [controlRoot(controls['setAnimationComponent-angle'])]
		},
		{
			case: 'set-scale',
			targets: [controlRoot(controls['setAnimationComponent-scale'])]
		},
		{
			case: 'set-speed',
			targets: [controlRoot(controls['setAnimationComponent-speed'])]
		},
		{
			case: 'set-opacity',
			targets: [controlRoot(controls['setAnimationComponent-opacity'])]
		},
		{
			case: 'set-priority',
			targets: [controlRoot(controls['setAnimationComponent-priority'])]
		},
		{
			case: 'set-offsetY',
			targets: [controlRoot(controls['setAnimationComponent-offsetY'])]
		},
		{
			case: 'set-sprite',
			targets: [
				controlRoot(controls['setAnimationComponent-spriteId']),
				controlRoot(controls['setAnimationComponent-image'])
			]
		},
		{
			case: 'play-motion',
			targets: [
				controlRoot(controls['setAnimationComponent-playMotion']),
				controlRoot(controls['setAnimationComponent-wait'])
			]
		}
	]);
	useLocalizedOptions('setAnimationComponent-wait', [true, false], (items) =>
		controls['setAnimationComponent-wait']?.loadItems?.(items)
	);
});
</script>

<style>
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
