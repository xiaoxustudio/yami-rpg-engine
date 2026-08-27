<template>
	<WindowFrame id="setTriggerMotion" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setTriggerMotion.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Trigger</div>
			<CustomBox id="setTriggerMotion-trigger" type="trigger" @input="onTrigger" />
			<div class="text">Motion</div>
			<CustomBox id="setTriggerMotion-motion" type="enum-string" @input="onMotion" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useSetTriggerMotionCommandSchema } from '@app/composables/commands/useSetTriggerMotionCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useSetTriggerMotionCommandSchema();

const onTrigger = (value: unknown) => {
	form.trigger = value;
};

const onMotion = (value: unknown) => {
	form.motion = value;
};

const onConfirm = () => {
	save();
};
</script>
