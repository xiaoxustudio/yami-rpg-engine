<template>
	<WindowFrame id="shakeScreen"
				:ref="registryRef(fieldEls, 'shakeScreen')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.shakeScreen.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Shake Mode</div>
			<SelectBox id="shakeScreen-mode"
				:ref="registryRef(fieldEls, 'shakeScreen-mode')" v-focus v-model="form.mode" />
			<div class="text">Power</div>
			<NumberBox id="shakeScreen-power"
				v-tip="t('components.shakeScreen-power.tip')" min="1" max="10" v-model="power" />
			<div class="text">Speed</div>
			<NumberBox id="shakeScreen-speed"
				v-tip="t('components.shakeScreen-speed.tip')" min="1" max="10" v-model="speed" />
			<div class="text">Easing</div>
			<SelectBox id="shakeScreen-easingId"
				:ref="registryRef(fieldEls, 'shakeScreen-easingId')" name="easing" v-model="form.easingId" />
			<div class="text">Duration</div>
			<NumberBox
				id="shakeScreen-duration"
				name="duration"
				min="1"
				max="3600000"
				unit="ms"
				v-model="duration"
			/>
			<div class="text">Wait</div>
			<SelectBox id="shakeScreen-wait"
				:ref="registryRef(fieldEls, 'shakeScreen-wait')" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useShakeScreenCommandSchema } from '@app/composables/commands/useShakeScreenCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useShakeScreenCommandSchema();

const power = computed({
	get: () => form.power as number | string,
	set: (value) => {
		form.power = value;
	}
});

const speed = computed({
	get: () => form.speed as number | string,
	set: (value) => {
		form.speed = value;
	}
});

const duration = computed({
	get: () => form.duration as number | string,
	set: (value) => {
		form.duration = value;
	}
});

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('shakeScreen-mode')?.loadItems?.([
		{ name: 'Random', value: 'random' },
		{ name: 'Horizontal', value: 'horizontal' },
		{ name: 'Vertical', value: 'vertical' }
	]);
	fieldEls.get('shakeScreen-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	fieldEls.get('shakeScreen')?.on?.('open', () => {
		fieldEls.get('shakeScreen-easingId')?.loadItems?.(Data.createEasingItems!());
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#shakeScreen {
	width: 324px;
	height: 218px;
}

#shakeScreen-confirm {
	right: 108px;
	bottom: 10px;
}

#shakeScreen-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
