<template>
	<WindowFrame
		id="changeActorSprite"
		:ref="registryRef(fieldEls, 'changeActorSprite')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.changeActorSprite.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.changeActorSprite-actor.label') }}</div>
			<CustomBox
				id="changeActorSprite-actor"
				:ref="registryRef(fieldEls, 'changeActorSprite-actor')"
				v-tip="t('components.changeActorSprite-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.changeActorSprite-animationId.label') }}</div>
			<CustomBox
				id="changeActorSprite-animationId"
				:ref="registryRef(fieldEls, 'changeActorSprite-animationId')"
				v-tip="t('components.changeActorSprite-animationId.tip')"
				type="file"
				filter="animation"
				v-model="form.animationId"
				@write="onWrite"
			/>
			<div class="text">{{ t('components.changeActorSprite-spriteId.label') }}</div>
			<SelectBox
				:label="t('components.changeActorSprite-spriteId.label')"
				id="changeActorSprite-spriteId"
				:ref="registryRef(fieldEls, 'changeActorSprite-spriteId')"
				v-tip="t('components.changeActorSprite-spriteId.tip')"
				v-model="form.spriteId"
			/>
			<div class="text">{{ t('components.changeActorSprite-image.label') }}</div>
			<CustomBox
				id="changeActorSprite-image"
				:ref="registryRef(fieldEls, 'changeActorSprite-image')"
				v-tip="t('components.changeActorSprite-image.tip')"
				type="file"
				filter="image"
				v-model="form.image"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { composableEls } from '@app/composables/element-registry';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { useChangeActorSpriteCommandSchema } from '@app/composables/commands/useChangeActorSpriteCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

// 本组件的控件元素注册表
const fieldEls = createElementRegistry(composableEls);

const { form, save, writeHandler } = useChangeActorSpriteCommandSchema();

const onWrite = (value: unknown) => {
	writeHandler({ value: value as string });
};

const onConfirm = () => {
	save();
};
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#changeActorSprite {
	width: 324px;
	height: 170px;
}

#changeActorSprite-confirm {
	right: 108px;
	bottom: 10px;
}

#changeActorSprite-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
