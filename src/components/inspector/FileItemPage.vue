<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileItem-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="fileItem-general-grid">
			<text>{{ local.getLabel('fileItem-icon') || 'Icon' }}</text
			><CustomBox id="fileItem-icon" type="file" filter="image" />
			<text>{{ local.getLabel('fileItem-clip') || 'Clip' }}</text
			><CustomBox id="fileItem-clip" type="clip" image="fileItem-icon" />
			<text>{{ local.getLabel('fileItem-inherit') || 'Inherit' }}</text
			><CustomBox id="fileItem-inherit" type="file" filter="item" />
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileItem-attributes') || 'Attributes' }}</DetailSummary>
		<ParamList
			id="fileItem-attributes"
			class="inspector-list"
			group="item"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileItem-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="fileItem-events"
			class="inspector-list"
			filter="item"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileItem-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="fileItem-scripts"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<ParameterPane id="fileItem-parameter-pane" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
