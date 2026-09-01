<template>
	<WindowFrame id="appendTarget" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.appendTarget.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="appendTarget-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Target</div>
			<CustomBox id="appendTarget-target" type="actor" v-model="form.target" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useAppendTargetCommandSchema } from '@app/composables/commands/useAppendTargetCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useAppendTargetCommandSchema();

const onConfirm = () => {
	save();
};
</script>
