<template>
	<WindowFrame id="removeAnimationComponent" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.removeAnimationComponent.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox
				id="removeAnimationComponent-actor"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">Animation</div>
			<CustomBox
				id="removeAnimationComponent-animationId"
				type="file"
				filter="animation"
				v-model="form.animationId"
				@write="onWrite"
			/>
			<div class="text">Motion</div>
			<SelectBox id="removeAnimationComponent-motion" v-model="form.motion" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRemoveAnimationComponentCommandSchema } from '@app/composables/commands/useRemoveAnimationComponentCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save, writeHandler } = useRemoveAnimationComponentCommandSchema();

const onWrite = (value: unknown) => {
	writeHandler({ value: value as string });
};

const onConfirm = () => {
	save();
};
</script>
