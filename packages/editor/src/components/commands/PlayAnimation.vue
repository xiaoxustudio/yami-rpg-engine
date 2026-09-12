<template>
	<WindowFrame id="playAnimation" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.playAnimation.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Mode</div>
			<SelectBox id="playAnimation-mode"
				:ref="registryRef(fieldEls, 'playAnimation-mode')" v-focus v-model="form.mode" />
			<div class="text">Position</div>
			<CustomBox id="playAnimation-position"
				:ref="registryRef(fieldEls, 'playAnimation-position')" type="position" v-model="form.position" />
			<div class="text">Actor</div>
			<CustomBox id="playAnimation-actor"
				:ref="registryRef(fieldEls, 'playAnimation-actor')" type="actor" v-model="form.actor" />
			<div class="text">Animation</div>
			<CustomBox
				id="playAnimation-animationId"
				:ref="registryRef(fieldEls, 'playAnimation-animationId')"
				v-focus
				type="file"
				filter="animation"
				v-model="form.animationId"
				@write="onWrite"
			/>
			<div class="text">Motion</div>
			<SelectBox id="playAnimation-motion" v-focus v-model="form.motion" />
			<div class="text">Rotatable</div>
			<SelectBox id="playAnimation-rotatable"
				:ref="registryRef(fieldEls, 'playAnimation-rotatable')" v-model="form.rotatable" />
			<div class="text">Priority</div>
			<NumberBox id="playAnimation-priority" min="-100" max="100" v-model="priority" />
			<div class="text">Offset Y</div>
			<NumberVar
				id="playAnimation-offsetY"
				min="-1000000000"
				max="1000000000"
				unit="px"
				v-model="form.offsetY"
			/>
			<div class="text">Angle</div>
			<NumberVar
				id="playAnimation-angle"
				min="-360"
				max="360"
				decimals="4"
				unit="deg"
				v-model="form.angle"
			/>
			<div class="text">Speed</div>
			<NumberVar
				id="playAnimation-speed"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.speed"
			/>
			<div class="text">Wait</div>
			<SelectBox id="playAnimation-wait"
				:ref="registryRef(fieldEls, 'playAnimation-wait')" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
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
	fieldEls.get('playAnimation-mode')?.loadItems?.([
		{ name: 'Position', value: 'position' },
		{ name: 'Actor', value: 'actor' }
	]);
	fieldEls.get('playAnimation-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'position', targets: [fieldEls.get('playAnimation-position')] },
			{ case: 'actor', targets: [fieldEls.get('playAnimation-actor')] }
		]);
	fieldEls.get('playAnimation-rotatable')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	fieldEls.get('playAnimation-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	const animationId = read(fieldEls.get('playAnimation-animationId'));
	if (animationId) writeHandler({ value: animationId });
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
