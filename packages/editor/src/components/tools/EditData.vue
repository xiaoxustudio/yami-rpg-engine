<template>
	<WindowFrame id="edit-data">
		<template #title
			><TitleBar
				>{{ t('components.edit-data.title') }}
				<div class="text hidden" id="edit-data-mark">✱</div>
				<div class="maximize" id="edit-data-maximize" />
				<div class="close" /> </TitleBar
		></template>

		<div class="box" id="edit-data-current"></div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';

const { t } = useI18n();

onMounted(() => {});
</script>
