<template>
	<WindowFrame
		id="setAmbientLight"
		:ref="registryRef(fieldEls, 'setAmbientLight')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.setAmbientLight.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setAmbientLight-red.label') }}</div>
			<NumberVar
				id="setAmbientLight-red"
				:ref="registryRef(fieldEls, 'setAmbientLight-red')"
				v-tip="t('components.setAmbientLight-red.tip')"
				v-focus
				min="0"
				max="255"
				step="5"
				v-model="form.red"
			/>
			<div class="text">{{ t('components.setAmbientLight-green.label') }}</div>
			<NumberVar
				id="setAmbientLight-green"
				:ref="registryRef(fieldEls, 'setAmbientLight-green')"
				v-tip="t('components.setAmbientLight-green.tip')"
				min="0"
				max="255"
				step="5"
				v-model="form.green"
			/>
			<div class="text">{{ t('components.setAmbientLight-blue.label') }}</div>
			<NumberVar
				id="setAmbientLight-blue"
				:ref="registryRef(fieldEls, 'setAmbientLight-blue')"
				v-tip="t('components.setAmbientLight-blue.tip')"
				min="0"
				max="255"
				step="5"
				v-model="form.blue"
			/>
			<div class="text">{{ t('components.setAmbientLight-easingId.label') }}</div>
			<SelectBox
				id="setAmbientLight-easingId"
				:ref="registryRef(fieldEls, 'setAmbientLight-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.setAmbientLight-duration.label') }}</div>
			<NumberVar
				id="setAmbientLight-duration"
				:ref="registryRef(fieldEls, 'setAmbientLight-duration')"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			/>
			<div class="text">{{ t('components.setAmbientLight-wait.label') }}</div>
			<SelectBox
				id="setAmbientLight-wait"
				:ref="registryRef(fieldEls, 'setAmbientLight-wait')"
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
import { useSetAmbientLightCommandSchema } from '@app/composables/commands/useSetAmbientLightCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetAmbientLightCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('setAmbientLight-wait', [true, false], (items) =>
		fieldEls.get('setAmbientLight-wait')?.loadItems?.(items)
	);
	fieldEls.get('setAmbientLight')?.on?.('open', () => {
		fieldEls.get('setAmbientLight-easingId')?.loadItems?.(Data.createEasingItems!());
	});
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setAmbientLight {
	width: 324px;
	height: 218px;
}

#setAmbientLight-filter {
	position: absolute;
	left: 318px;
	top: 10px;
	width: 100px;
	height: 164px;
}

#setAmbientLight-confirm {
	right: 108px;
	bottom: 10px;
}

#setAmbientLight-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
