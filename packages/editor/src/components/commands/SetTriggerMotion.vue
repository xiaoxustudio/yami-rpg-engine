<template>
	<WindowFrame id="setTriggerMotion" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setTriggerMotion.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Trigger</div>
			<CustomBox id="setTriggerMotion-trigger" v-focus type="trigger" v-model="form.trigger" />
			<div class="text">Motion</div>
			<CustomBox id="setTriggerMotion-motion" type="enum-string" v-model="form.motion" />
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

const onConfirm = () => {
	save();
};
</script>
