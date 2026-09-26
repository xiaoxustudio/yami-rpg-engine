<template>
	<WindowFrame
		id="playAnimation"
		:ref="registryRef(fieldEls, 'playAnimation')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.playAnimation.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.playAnimation-mode.label') }}</div>
			<SelectBox
				id="playAnimation-mode"
				v-tip="t('components.playAnimation-mode.tip')"
				:ref="registryRef(fieldEls, 'playAnimation-mode')"
				v-focus
				v-model="form.mode"
			/>
			<div class="text">{{ t('components.playAnimation-position.label') }}</div>
			<CustomBox
				id="playAnimation-position"
				v-tip="t('components.playAnimation-position.tip')"
				:ref="registryRef(fieldEls, 'playAnimation-position')"
				type="position"
				v-model="form.position"
			/>
			<div class="text">{{ t('components.playAnimation-actor.label') }}</div>
			<CustomBox
				id="playAnimation-actor"
				v-tip="t('components.playAnimation-actor.tip')"
				:ref="registryRef(fieldEls, 'playAnimation-actor')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.playAnimation-animationId.label') }}</div>
			<CustomBox
				id="playAnimation-animationId"
				v-tip="t('components.playAnimation-animationId.tip')"
				:ref="registryRef(fieldEls, 'playAnimation-animationId')"
				v-focus
				type="file"
				filter="animation"
				v-model="form.animationId"
				@write="onWrite"
			/>
			<div class="text">{{ t('components.playAnimation-motion.label') }}</div>
			<SelectBox
				id="playAnimation-motion"
				:ref="registryRef(fieldEls, 'playAnimation-motion')"
				v-tip="t('components.playAnimation-motion.tip')"
				v-focus
				v-model="form.motion"
			/>
			<div class="text">{{ t('components.playAnimation-rotatable.label') }}</div>
			<SelectBox
				id="playAnimation-rotatable"
				v-tip="t('components.playAnimation-rotatable.tip')"
				:ref="registryRef(fieldEls, 'playAnimation-rotatable')"
				v-model="form.rotatable"
			/>
			<div class="text">{{ t('components.playAnimation-priority.label') }}</div>
			<NumberBox
				id="playAnimation-priority"
				:ref="registryRef(fieldEls, 'playAnimation-priority')"
				v-tip="t('components.playAnimation-priority.tip')"
				min="-100"
				max="100"
				v-model="priority"
			/>
			<div class="text">{{ t('components.playAnimation-offsetY.label') }}</div>
			<NumberVar
				id="playAnimation-offsetY"
				:ref="registryRef(fieldEls, 'playAnimation-offsetY')"
				v-tip="t('components.playAnimation-offsetY.tip')"
				min="-1000000000"
				max="1000000000"
				unit="px"
				v-model="form.offsetY"
			/>
			<div class="text">{{ t('components.playAnimation-angle.label') }}</div>
			<NumberVar
				id="playAnimation-angle"
				:ref="registryRef(fieldEls, 'playAnimation-angle')"
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
				:ref="registryRef(fieldEls, 'playAnimation-speed')"
				v-tip="t('components.playAnimation-speed.tip')"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.speed"
			/>
			<div class="text">{{ t('components.playAnimation-wait.label') }}</div>
			<SelectBox
				id="playAnimation-wait"
				:ref="registryRef(fieldEls, 'playAnimation-wait')"
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

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlayAnimationCommandSchema } from '@app/composables/commands/usePlayAnimationCommandSchema';
import { read } from '@app/utils/element-utils';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

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

onMounted(() => {
	useLocalizedOptions('playAnimation-mode', ['position', 'actor'], (items) =>
		fieldEls.get('playAnimation-mode')?.loadItems?.(items)
	);
	fieldEls
		.get('playAnimation-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'position', targets: [fieldEls.get('playAnimation-position')] },
			{ case: 'actor', targets: [fieldEls.get('playAnimation-actor')] }
		]);
	useLocalizedOptions('playAnimation-rotatable', [true, false], (items) =>
		fieldEls.get('playAnimation-rotatable')?.loadItems?.(items)
	);
	useLocalizedOptions('playAnimation-wait', [true, false], (items) =>
		fieldEls.get('playAnimation-wait')?.loadItems?.(items)
	);
	const animationId = read(fieldEls.get('playAnimation-animationId'));
	if (animationId) writeHandler({ value: animationId });
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
