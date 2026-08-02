<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileState-general-grid') || 'General' }}</DetailSummary>
		<detail-grid id="fileState-general-grid">
			<text>{{ local.getLabel('fileState-icon') || 'Icon' }}</text
			><CustomBox id="fileState-icon" type="file" filter="image" />
			<text>{{ local.getLabel('fileState-clip') || 'Clip' }}</text
			><CustomBox id="fileState-clip" type="clip" image="fileState-icon" />
			<text>{{ local.getLabel('fileState-inherit') || 'Inherit' }}</text
			><CustomBox id="fileState-inherit" type="file" filter="state" />
		</detail-grid>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileState-attributes') || 'Attributes' }}</DetailSummary>
		<ParamList
			id="fileState-attributes"
			class="inspector-list"
			group="state"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileState-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="fileState-events"
			class="inspector-list"
			filter="state"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileState-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
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
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
