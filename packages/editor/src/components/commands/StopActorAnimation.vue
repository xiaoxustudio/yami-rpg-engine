<template>
	<WindowFrame id="stopActorAnimation" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.stopActorAnimation.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="stopActorAnimation-actor" type="actor" @input="onActor" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStopActorAnimationCommandSchema } from '@app/composables/commands/useStopActorAnimationCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useStopActorAnimationCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onConfirm = () => {
	save();
};
</script>
