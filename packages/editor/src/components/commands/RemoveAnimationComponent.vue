<template>
	<WindowFrame
		id="removeAnimationComponent"
		:ref="registryRef(fieldEls, 'removeAnimationComponent')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.removeAnimationComponent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.removeAnimationComponent-actor.label') }}</div>
			<CustomBox
				id="removeAnimationComponent-actor"
				:ref="registryRef(fieldEls, 'removeAnimationComponent-actor')"
				v-tip="t('components.removeAnimationComponent-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.removeAnimationComponent-animationId.label') }}</div>
			<CustomBox
				id="removeAnimationComponent-animationId"
				:ref="registryRef(fieldEls, 'removeAnimationComponent-animationId')"
				v-tip="t('components.removeAnimationComponent-animationId.tip')"
				type="file"
				filter="animation"
				v-model="form.animationId"
				@write="onWrite"
			/>
			<div class="text">{{ t('components.removeAnimationComponent-motion.label') }}</div>
			<SelectBox
				id="removeAnimationComponent-motion"
				:ref="registryRef(fieldEls, 'removeAnimationComponent-motion')"
				v-tip="t('components.removeAnimationComponent-motion.tip')"
				v-model="form.motion"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { composableEls } from '@app/composables/element-registry';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { useRemoveAnimationComponentCommandSchema } from '@app/composables/commands/useRemoveAnimationComponentCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

// 本组件的控件元素注册表
const fieldEls = createElementRegistry(composableEls);

const { form, save, writeHandler } = useRemoveAnimationComponentCommandSchema();

const onWrite = (value: unknown) => {
	writeHandler({ value: value as string });
};

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#removeAnimationComponent {
	width: 324px;
	height: 146px;
}

#removeAnimationComponent-confirm {
	right: 108px;
	bottom: 10px;
}

#removeAnimationComponent-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
