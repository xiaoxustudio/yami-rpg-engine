<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileItem-general-grid') || 'General' }}</detail-summary>
		<detail-grid id="fileItem-general-grid">
			<text>{{ local.getLabel('fileItem-icon') || 'Icon' }}</text
			><custom-box id="fileItem-icon" type="file" filter="image" />
			<text>{{ local.getLabel('fileItem-clip') || 'Clip' }}</text
			><custom-box id="fileItem-clip" type="clip" image="fileItem-icon" />
			<text>{{ local.getLabel('fileItem-inherit') || 'Inherit' }}</text
			><custom-box id="fileItem-inherit" type="file" filter="item" />
		</detail-grid>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileItem-attributes') || 'Attributes' }}</detail-summary>
		<param-list
			id="fileItem-attributes"
			class="inspector-list"
			group="item"
			flexible
		/>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileItem-events') || 'Events' }}</detail-summary>
		<param-list
			id="fileItem-events"
			class="inspector-list"
			filter="item"
			flexible
		/>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileItem-scripts') || 'Scripts' }}</detail-summary>
		<param-list
			id="fileItem-scripts"
			class="inspector-list"
			flexible
		/>
	</detail-box>
	<parameter-pane id="fileItem-parameter-pane" />
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
