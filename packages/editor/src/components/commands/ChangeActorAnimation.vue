<template>
	<WindowFrame id="changeActorAnimation" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeActorAnimation.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="changeActorAnimation-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Animation</div>
			<CustomBox
				id="changeActorAnimation-animationId"
				type="file"
				filter="animation"
				v-model="form.animationId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useChangeActorAnimationCommandSchema } from '@app/composables/commands/useChangeActorAnimationCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useChangeActorAnimationCommandSchema();

const onConfirm = () => {
	save();
};
</script>
