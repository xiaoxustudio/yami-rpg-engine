<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileEquipment-general-grid') || 'General' }}</detail-summary>
		<detail-grid id="fileEquipment-general-grid">
			<text>{{ local.getLabel('fileEquipment-icon') || 'Icon' }}</text
			><custom-box id="fileEquipment-icon" type="file" filter="image" />
			<text>{{ local.getLabel('fileEquipment-clip') || 'Clip' }}</text
			><custom-box
				id="fileEquipment-clip"
				type="clip"
				image="fileEquipment-icon"
			/>
			<text>{{ local.getLabel('fileEquipment-inherit') || 'Inherit' }}</text
			><custom-box
				id="fileEquipment-inherit"
				type="file"
				filter="equipment"
			/>
		</detail-grid>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileEquipment-attributes') || 'Attributes' }}</detail-summary>
		<param-list
			id="fileEquipment-attributes"
			class="inspector-list"
			group="equipment"
			flexible
		/>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileEquipment-events') || 'Events' }}</detail-summary>
		<param-list
			id="fileEquipment-events"
			class="inspector-list"
			filter="equipment"
			flexible
		/>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileEquipment-scripts') || 'Scripts' }}</detail-summary>
		<param-list
			id="fileEquipment-scripts"
			class="inspector-list"
			flexible
		/>
	</detail-box>
	<parameter-pane id="fileEquipment-parameter-pane" />
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
