<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileSkill-general-grid') || 'General' }}</detail-summary>
		<detail-grid id="fileSkill-general-grid">
			<text>{{ local.getLabel('fileSkill-icon') || 'Icon' }}</text
			><custom-box id="fileSkill-icon" type="file" filter="image" />
			<text>{{ local.getLabel('fileSkill-clip') || 'Clip' }}</text
			><custom-box id="fileSkill-clip" type="clip" image="fileSkill-icon" />
			<text>{{ local.getLabel('fileSkill-inherit') || 'Inherit' }}</text
			><custom-box id="fileSkill-inherit" type="file" filter="skill" />
		</detail-grid>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileSkill-attributes') || 'Attributes' }}</detail-summary>
		<param-list
			id="fileSkill-attributes"
			class="inspector-list"
			group="skill"
			flexible
		/>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileSkill-events') || 'Events' }}</detail-summary>
		<param-list
			id="fileSkill-events"
			class="inspector-list"
			filter="skill"
			flexible
		/>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileSkill-scripts') || 'Scripts' }}</detail-summary>
		<param-list
			id="fileSkill-scripts"
			class="inspector-list"
			flexible
		/>
	</detail-box>
	<parameter-pane id="fileSkill-parameter-pane" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
