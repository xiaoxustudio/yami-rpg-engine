<template>
	<WindowFrame id="wait" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.wait.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Duration</div>
			<NumberVar id="wait-duration" v-focus min="1" max="3600000" unit="ms" v-model="form.duration" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useWaitCommandSchema } from '@app/composables/commands/useWaitCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';

const { t } = useI18n();

const { form, save } = useWaitCommandSchema();

const onConfirm = () => {
	save();
};
</script>
