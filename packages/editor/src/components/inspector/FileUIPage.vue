<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileUI-foreground-grid') || 'Stage Foreground' }}</DetailSummary>
		<div class="detail-grid" id="fileUI-foreground-grid">
			<div class="text">{{ local.getLabel('fileUI-width') || 'Width' }}</div
			><NumberBox id="fileUI-width" min="8" max="7680" unit="px" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileUI-height') || 'Height' }}</div
			><NumberBox id="fileUI-height" min="8" max="7680" unit="px" @input="onParamInput" />
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const local = useLocalStore();

const onParamInput = (event: Event) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.fileUI?.paramInput?.({ target });
};

onMounted(() => {
});
</script>
