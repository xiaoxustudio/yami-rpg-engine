<template>
	<WindowFrame id="setAngle" :ref="registryRef(fieldEls, 'setAngle')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setAngle.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setAngle-actor.label') }}</div>
			<CustomBox
				id="setAngle-actor"
				:ref="registryRef(fieldEls, 'setAngle-actor')"
				v-tip="t('components.setAngle-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.setAngle-angle.label') }}</div>
			<CustomBox
				id="setAngle-angle"
				:ref="registryRef(fieldEls, 'setAngle-angle')"
				v-tip="t('components.setAngle-angle.tip')"
				type="angle"
				v-model="form.angle"
			/>
			<div class="text">{{ t('components.setAngle-easingId.label') }}</div>
			<SelectBox
				id="setAngle-easingId"
				:ref="registryRef(fieldEls, 'setAngle-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.setAngle-duration.label') }}</div>
			<NumberVar
				id="setAngle-duration"
				:ref="registryRef(fieldEls, 'setAngle-duration')"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			/>
			<div class="text">{{ t('components.setAngle-wait.label') }}</div>
			<SelectBox
				id="setAngle-wait"
				:ref="registryRef(fieldEls, 'setAngle-wait')"
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
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetAngleCommandSchema } from '@app/composables/commands/useSetAngleCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetAngleCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('setAngle-wait', [true, false], (items) =>
		fieldEls.get('setAngle-wait')?.loadItems?.(items)
	);
	fieldEls.get('setAngle')?.on?.('open', () => {
		fieldEls.get('setAngle-easingId')?.loadItems?.(Data.createEasingItems!());
	});
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setAngle {
	width: 324px;
	height: 194px;
}

#setAngle-confirm {
	right: 108px;
	bottom: 10px;
}

#setAngle-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
