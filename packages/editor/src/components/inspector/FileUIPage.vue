<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileUI-foreground-grid.label') || 'Stage Foreground' }}</DetailSummary>
		<div class="detail-grid" id="fileUI-foreground-grid">
			<div class="text">{{ t('components.fileUI-width.label') || 'Width' }}</div
			><NumberBox id="fileUI-width" min="8" max="7680" unit="px" @input="onParamInput" />
			<div class="text">{{ t('components.fileUI-height.label') || 'Height' }}</div
			><NumberBox id="fileUI-height" min="8" max="7680" unit="px" @input="onParamInput" />
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import '@app/legacy/inspector/file-ui-page.ts';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const { t } = useI18n();

const onParamInput = (event: Event) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.fileUI?.paramInput?.({ target });
};

onMounted(() => {
});
</script>
