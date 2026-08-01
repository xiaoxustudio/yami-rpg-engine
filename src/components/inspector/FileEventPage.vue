<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileEvent-general-grid') || 'General' }}</detail-summary>
		<detail-grid id="fileEvent-general-grid">
			<text>{{ local.getLabel('fileEvent-type') || 'Type' }}</text><select-box id="fileEvent-type" />
			<text>{{ local.getLabel('fileEvent-enabled') || 'Enabled' }}</text
			><check-box id="fileEvent-enabled" class="standard large" />
			<text>{{ local.getLabel('fileEvent-priority') || 'Priority' }}</text
			><check-box id="fileEvent-priority" class="standard large" />
			<text>{{ local.getLabel('fileEvent-namespace') || 'Namespace' }}</text
			><check-box id="fileEvent-namespace" class="standard large" />
			<text>{{ local.getLabel('fileEvent-returnType') || 'Return Type' }}</text
			><select-box id="fileEvent-returnType" />
			<text>{{ local.getLabel('fileEvent-description') || 'Description' }}</text><text-area id="fileEvent-description" />
		</detail-grid>
		<detail-box open>
			<detail-summary>{{ local.getLabel('fileEvent-parameters') || 'Parameters' }}</detail-summary>
			<param-list
				id="fileEvent-parameters"
				class="inspector-list"
				flexible
			/>
		</detail-box>
	</detail-box>
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
