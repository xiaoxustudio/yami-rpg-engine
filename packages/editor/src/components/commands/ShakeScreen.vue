<template>
	<WindowFrame id="shakeScreen" :ref="registryRef(fieldEls, 'shakeScreen')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.shakeScreen.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.shakeScreen-mode.label') }}</div>
			<SelectBox
				:label="t('components.shakeScreen-mode.label')"
				id="shakeScreen-mode"
				:ref="registryRef(fieldEls, 'shakeScreen-mode')"
				v-focus
				v-model="form.mode"
			/>
			<div class="text">{{ t('components.shakeScreen-power.label') }}</div>
			<NumberBox
				:label="t('components.shakeScreen-power.label')"
				id="shakeScreen-power"
				:ref="registryRef(fieldEls, 'shakeScreen-power')"
				v-tip="t('components.shakeScreen-power.tip')"
				min="1"
				max="10"
				v-model="power"
			/>
			<div class="text">{{ t('components.shakeScreen-speed.label') }}</div>
			<NumberBox
				:label="t('components.shakeScreen-speed.label')"
				id="shakeScreen-speed"
				:ref="registryRef(fieldEls, 'shakeScreen-speed')"
				v-tip="t('components.shakeScreen-speed.tip')"
				min="1"
				max="10"
				v-model="speed"
			/>
			<div class="text">{{ t('components.shakeScreen-easingId.label') }}</div>
			<SelectBox
				:label="t('components.shakeScreen-easingId.label')"
				id="shakeScreen-easingId"
				:ref="registryRef(fieldEls, 'shakeScreen-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.shakeScreen-duration.label') }}</div>
			<NumberBox
				:label="t('components.shakeScreen-duration.label')"
				id="shakeScreen-duration"
				:ref="registryRef(fieldEls, 'shakeScreen-duration')"
				name="duration"
				min="1"
				max="3600000"
				unit="ms"
				v-model="duration"
			/>
			<div class="text">{{ t('components.shakeScreen-wait.label') }}</div>
			<SelectBox
				:label="t('components.shakeScreen-wait.label')"
				id="shakeScreen-wait"
				:ref="registryRef(fieldEls, 'shakeScreen-wait')"
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
	useLocalizedOptions('shakeScreen-mode', ['random', 'horizontal', 'vertical'], (items) =>
		fieldEls.get('shakeScreen-mode')?.loadItems?.(items)
	);
	useLocalizedOptions('shakeScreen-wait', [true, false], (items) =>
		fieldEls.get('shakeScreen-wait')?.loadItems?.(items)
	);
	fieldEls.get('shakeScreen')?.on?.('open', () => {
		fieldEls.get('shakeScreen-easingId')?.loadItems?.(Data.createEasingItems!());
	});
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
