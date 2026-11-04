<template>
	<WindowFrame id="playAnimation" :ref="controlRef('playAnimation')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.playAnimation.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.playAnimation-mode.label') }}</div>
			<SelectBox
				:label="t('components.playAnimation-mode.label')"
				id="playAnimation-mode"
				v-tip="t('components.playAnimation-mode.tip')"
				:ref="controlRef('playAnimation-mode')"
				v-focus
				v-model="form.mode"
			/>
			<div class="text">{{ t('components.playAnimation-position.label') }}</div>
			<CustomBox
				id="playAnimation-position"
				v-tip="t('components.playAnimation-position.tip')"
				:ref="controlRef('playAnimation-position')"
				type="position"
				v-model="form.position"
			/>
			<div class="text">{{ t('components.playAnimation-actor.label') }}</div>
			<CustomBox
				id="playAnimation-actor"
				v-tip="t('components.playAnimation-actor.tip')"
				:ref="controlRef('playAnimation-actor')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.playAnimation-animationId.label') }}</div>
			<CustomBox
				id="playAnimation-animationId"
				v-tip="t('components.playAnimation-animationId.tip')"
				:ref="controlRef('playAnimation-animationId')"
				v-focus
				type="file"
				filter="animation"
				v-model="form.animationId"
				@write="onWrite"
			/>
			<div class="text">{{ t('components.playAnimation-motion.label') }}</div>
			<SelectBox
				:label="t('components.playAnimation-motion.label')"
				id="playAnimation-motion"
				:ref="controlRef('playAnimation-motion')"
				v-tip="t('components.playAnimation-motion.tip')"
				v-focus
				v-model="form.motion"
			/>
			<div class="text">{{ t('components.playAnimation-rotatable.label') }}</div>
			<SelectBox
				:label="t('components.playAnimation-rotatable.label')"
				id="playAnimation-rotatable"
				v-tip="t('components.playAnimation-rotatable.tip')"
				:ref="controlRef('playAnimation-rotatable')"
				v-model="form.rotatable"
			/>
			<div class="text">{{ t('components.playAnimation-priority.label') }}</div>
			<NumberBox
				:label="t('components.playAnimation-priority.label')"
				id="playAnimation-priority"
				:ref="controlRef('playAnimation-priority')"
				v-tip="t('components.playAnimation-priority.tip')"
				min="-100"
				max="100"
				v-model="priority"
			/>
			<div class="text">{{ t('components.playAnimation-offsetY.label') }}</div>
			<NumberVar
				id="playAnimation-offsetY"
				:ref="controlRef('playAnimation-offsetY')"
				v-tip="t('components.playAnimation-offsetY.tip')"
				min="-1000000000"
				max="1000000000"
				unit="px"
				v-model="form.offsetY"
			/>
			<div class="text">{{ t('components.playAnimation-angle.label') }}</div>
			<NumberVar
				id="playAnimation-angle"
				:ref="controlRef('playAnimation-angle')"
				v-tip="t('components.playAnimation-angle.tip')"
				min="-360"
				max="360"
				decimals="4"
				unit="deg"
				v-model="form.angle"
			/>
			<div class="text">{{ t('components.playAnimation-speed.label') }}</div>
			<NumberVar
				id="playAnimation-speed"
				:ref="controlRef('playAnimation-speed')"
				v-tip="t('components.playAnimation-speed.tip')"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.speed"
			/>
			<div class="text">{{ t('components.playAnimation-wait.label') }}</div>
			<SelectBox
				:label="t('components.playAnimation-wait.label')"
				id="playAnimation-wait"
				:ref="controlRef('playAnimation-wait')"
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
import { usePlayAnimationCommandSchema } from '@app/composables/commands/usePlayAnimationCommandSchema';
import { read } from '@app/utils/element-utils';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';
import {
	providePlayAnimationBridge,
	resetPlayAnimationBridge,
	type PlayAnimationBridge
} from '@app/composables/play-animation-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'playAnimation-actor'
	| 'playAnimation-angle'
	| 'playAnimation-animationId'
	| 'playAnimation-mode'
	| 'playAnimation-motion'
	| 'playAnimation-offsetY'
	| 'playAnimation-position'
	| 'playAnimation-priority'
	| 'playAnimation-rotatable'
	| 'playAnimation-speed'
	| 'playAnimation-wait'
	| 'playAnimation';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save, writeHandler } = usePlayAnimationCommandSchema();

const priority = computed({
	get: () => form.priority as number | string,
	set: (value) => {
		form.priority = value;
	}
});

const onWrite = (value: unknown) => {
	writeHandler({ value: value as string });
};

const onConfirm = () => {
	save();
};

/** 控件级能力：schema 载入/保存要用，但 schema 不该知道控件 id。 */
const bridgeApi: PlayAnimationBridge = {
	reloadMotion: (items) => {
		controls['playAnimation-motion']?.loadItems?.(items);
		controls['playAnimation-motion']?.write2?.(
			controls['playAnimation-motion']?.read?.() as string
		);
	}
};

onMounted(() => {
	providePlayAnimationBridge(bridgeApi);
	onUnmounted(() => resetPlayAnimationBridge(bridgeApi));
	useLocalizedOptions('playAnimation-mode', ['position', 'actor'], (items) =>
		controls['playAnimation-mode']?.loadItems?.(items)
	);
	controls['playAnimation-mode']?.enableHiddenMode?.();
	controls['playAnimation-mode']?.relate?.([
		{ case: 'position', targets: [controlRoot(controls['playAnimation-position'])] },
		{ case: 'actor', targets: [controlRoot(controls['playAnimation-actor'])] }
	]);
	useLocalizedOptions('playAnimation-rotatable', [true, false], (items) =>
		controls['playAnimation-rotatable']?.loadItems?.(items)
	);
	useLocalizedOptions('playAnimation-wait', [true, false], (items) =>
		controls['playAnimation-wait']?.loadItems?.(items)
	);
	const animationId = read(controls['playAnimation-animationId']);
	if (animationId) writeHandler({ value: animationId });
});
</script>

<style>
#playAnimation {
	width: 324px;
	height: 314px;
}

#playAnimation-confirm {
	right: 108px;
	bottom: 10px;
}

#playAnimation-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
