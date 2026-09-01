<template>
	<WindowFrame id="changeActorSprite" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeActorSprite.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="changeActorSprite-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Animation</div>
			<CustomBox
				id="changeActorSprite-animationId"
				type="file"
				filter="animation"
				v-model="form.animationId"
				@write="onWrite"
			/>
			<div class="text">Sprite Name</div>
			<SelectBox id="changeActorSprite-spriteId" v-model="form.spriteId" />
			<div class="text">Sprite</div>
			<CustomBox
				id="changeActorSprite-image"
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
