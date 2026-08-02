<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileSkill-general-grid') || 'General' }}</DetailSummary>
		<detail-grid id="fileSkill-general-grid">
			<text>{{ local.getLabel('fileSkill-icon') || 'Icon' }}</text
			><CustomBox id="fileSkill-icon" type="file" filter="image" />
			<text>{{ local.getLabel('fileSkill-clip') || 'Clip' }}</text
			><CustomBox id="fileSkill-clip" type="clip" image="fileSkill-icon" />
			<text>{{ local.getLabel('fileSkill-inherit') || 'Inherit' }}</text
			><CustomBox id="fileSkill-inherit" type="file" filter="skill" />
		</detail-grid>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileSkill-attributes') || 'Attributes' }}</DetailSummary>
		<ParamList
			id="fileSkill-attributes"
			class="inspector-list"
			group="skill"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileSkill-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="fileSkill-events"
			class="inspector-list"
			filter="skill"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileSkill-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="fileSkill-scripts"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<parameter-pane id="fileSkill-parameter-pane" />
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
