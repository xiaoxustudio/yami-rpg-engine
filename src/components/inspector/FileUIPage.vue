<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileUI-foreground-grid') || 'Stage Foreground' }}</DetailSummary>
		<div class="detail-grid" id="fileUI-foreground-grid">
			<text>{{ local.getLabel('fileUI-width') || 'Width' }}</text
			><NumberBox id="fileUI-width" min="8" max="7680" unit="px" />
			<text>{{ local.getLabel('fileUI-height') || 'Height' }}</text
			><NumberBox id="fileUI-height" min="8" max="7680" unit="px" />
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUIStore } from '@app/stores/ui';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const ui = useUIStore();
const local = useLocalStore();

onMounted(() => {
	ui.syncState();
	local.syncState();
});
</script>
