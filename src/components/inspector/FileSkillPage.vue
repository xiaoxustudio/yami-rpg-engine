<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileSkill-general-grid') || 'General' }}</DetailSummary>
		<detail-grid id="fileSkill-general-grid">
			<text>{{ local.getLabel('fileSkill-icon') || 'Icon' }}</text
			><custom-box id="fileSkill-icon" type="file" filter="image" />
			<text>{{ local.getLabel('fileSkill-clip') || 'Clip' }}</text
			><custom-box id="fileSkill-clip" type="clip" image="fileSkill-icon" />
			<text>{{ local.getLabel('fileSkill-inherit') || 'Inherit' }}</text
			><custom-box id="fileSkill-inherit" type="file" filter="skill" />
		</detail-grid>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileSkill-attributes') || 'Attributes' }}</DetailSummary>
		<param-list
			id="fileSkill-attributes"
			class="inspector-list"
			group="skill"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileSkill-events') || 'Events' }}</DetailSummary>
		<param-list
			id="fileSkill-events"
			class="inspector-list"
			filter="skill"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileSkill-scripts') || 'Scripts' }}</DetailSummary>
		<param-list
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

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
