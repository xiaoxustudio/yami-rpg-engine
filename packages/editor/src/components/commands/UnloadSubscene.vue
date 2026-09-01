<template>
	<WindowFrame id="unloadSubscene" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.unloadSubscene.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Scene</div>
			<FileVar
				id="unloadSubscene-sceneId"
				v-focus
				type="file"
				filter="scene"
				v-model="form.sceneId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useUnloadSubsceneCommandSchema } from '@app/composables/commands/useUnloadSubsceneCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import FileVar from '@app/components/common/FileVar.vue';

const { t } = useI18n();

const { form, save } = useUnloadSubsceneCommandSchema();

const onConfirm = () => {
	save();
};
</script>
