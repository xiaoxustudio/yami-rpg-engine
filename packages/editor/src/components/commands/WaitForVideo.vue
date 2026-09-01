<template>
	<WindowFrame id="waitForVideo" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.waitForVideo.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Element</div>
			<CustomBox id="waitForVideo-element" v-focus type="element" v-model="form.element" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useWaitForVideoCommandSchema } from '@app/composables/commands/useWaitForVideoCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useWaitForVideoCommandSchema();

const onConfirm = () => {
	save();
};
</script>
