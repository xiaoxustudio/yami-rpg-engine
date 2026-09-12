<template>
	<WindowFrame id="changeActorSprite" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeActorSprite.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="changeActorSprite-actor"
				v-tip="t('components.changeActorSprite-actor.tip')" v-focus type="actor" v-model="form.actor" />
			<div class="text">Animation</div>
			<CustomBox
				id="changeActorSprite-animationId"
				v-tip="t('components.changeActorSprite-animationId.tip')"
				type="file"
				filter="animation"
				v-model="form.animationId"
				@write="onWrite"
			/>
			<div class="text">Sprite Name</div>
			<SelectBox id="changeActorSprite-spriteId"
				v-tip="t('components.changeActorSprite-spriteId.tip')" v-model="form.spriteId" />
			<div class="text">Sprite</div>
			<CustomBox
				id="changeActorSprite-image"
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
import { useChangeActorSpriteCommandSchema } from '@app/composables/commands/useChangeActorSpriteCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save, writeHandler } = useChangeActorSpriteCommandSchema();

const onWrite = (value: unknown) => {
	writeHandler({ value: value as string });
};

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
