<template>
	<WindowFrame id="copyProgress" no-buttons>
		<template #title
			><TitleBar>{{ t('components.copyProgress.title') }}</TitleBar></template
		>

		<div class="flex-box" id="copyProgress-flex">
			<div class="text">{{ t('components.copyProgress-box.label') }}</div>
			<div class="box" id="copyProgress-box">
				<div class="box" id="copyProgress-bar" />
			</div>
			<div class="text" id="copyProgress-info" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {});
</script>
