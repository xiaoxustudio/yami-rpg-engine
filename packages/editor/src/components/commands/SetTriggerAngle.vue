<template>
	<WindowFrame id="setTriggerAngle" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setTriggerAngle.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Trigger</div>
			<CustomBox id="setTriggerAngle-trigger" v-focus type="trigger" v-model="form.trigger" />
			<div class="text">Angle</div>
			<CustomBox id="setTriggerAngle-angle" type="angle" v-model="form.angle" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useSetTriggerAngleCommandSchema } from '@app/composables/commands/useSetTriggerAngleCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useSetTriggerAngleCommandSchema();

const onConfirm = () => {
	save();
};
</script>
