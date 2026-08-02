<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileState-general-grid') || 'General' }}</DetailSummary>
		<detail-grid id="fileState-general-grid">
			<text>{{ local.getLabel('fileState-icon') || 'Icon' }}</text
			><custom-box id="fileState-icon" type="file" filter="image" />
			<text>{{ local.getLabel('fileState-clip') || 'Clip' }}</text
			><custom-box id="fileState-clip" type="clip" image="fileState-icon" />
			<text>{{ local.getLabel('fileState-inherit') || 'Inherit' }}</text
			><custom-box id="fileState-inherit" type="file" filter="state" />
		</detail-grid>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileState-attributes') || 'Attributes' }}</DetailSummary>
		<param-list
			id="fileState-attributes"
			class="inspector-list"
			group="state"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileState-events') || 'Events' }}</DetailSummary>
		<param-list
			id="fileState-events"
			class="inspector-list"
			filter="state"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileState-scripts') || 'Scripts' }}</DetailSummary>
		<param-list
			id="fileState-scripts"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<parameter-pane id="fileState-parameter-pane" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
