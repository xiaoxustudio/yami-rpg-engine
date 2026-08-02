<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileItem-general-grid') || 'General' }}</DetailSummary>
		<detail-grid id="fileItem-general-grid">
			<text>{{ local.getLabel('fileItem-icon') || 'Icon' }}</text
			><custom-box id="fileItem-icon" type="file" filter="image" />
			<text>{{ local.getLabel('fileItem-clip') || 'Clip' }}</text
			><custom-box id="fileItem-clip" type="clip" image="fileItem-icon" />
			<text>{{ local.getLabel('fileItem-inherit') || 'Inherit' }}</text
			><custom-box id="fileItem-inherit" type="file" filter="item" />
		</detail-grid>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileItem-attributes') || 'Attributes' }}</DetailSummary>
		<param-list
			id="fileItem-attributes"
			class="inspector-list"
			group="item"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileItem-events') || 'Events' }}</DetailSummary>
		<param-list
			id="fileItem-events"
			class="inspector-list"
			filter="item"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileItem-scripts') || 'Scripts' }}</DetailSummary>
		<param-list
			id="fileItem-scripts"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<parameter-pane id="fileItem-parameter-pane" />
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
