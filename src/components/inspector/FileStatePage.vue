<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileState-general-grid') || 'General' }}</detail-summary>
		<detail-grid id="fileState-general-grid">
			<text>{{ local.getLabel('fileState-icon') || 'Icon' }}</text
			><custom-box id="fileState-icon" type="file" filter="image" />
			<text>{{ local.getLabel('fileState-clip') || 'Clip' }}</text
			><custom-box id="fileState-clip" type="clip" image="fileState-icon" />
			<text>{{ local.getLabel('fileState-inherit') || 'Inherit' }}</text
			><custom-box id="fileState-inherit" type="file" filter="state" />
		</detail-grid>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileState-attributes') || 'Attributes' }}</detail-summary>
		<param-list
			id="fileState-attributes"
			class="inspector-list"
			group="state"
			flexible
		/>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileState-events') || 'Events' }}</detail-summary>
		<param-list
			id="fileState-events"
			class="inspector-list"
			filter="state"
			flexible
		/>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileState-scripts') || 'Scripts' }}</detail-summary>
		<param-list
			id="fileState-scripts"
			class="inspector-list"
			flexible
		/>
	</detail-box>
	<parameter-pane id="fileState-parameter-pane" />
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
