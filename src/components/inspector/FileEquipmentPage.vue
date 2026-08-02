<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileEquipment-general-grid') || 'General' }}</DetailSummary>
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
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileEquipment-attributes') || 'Attributes' }}</DetailSummary>
		<param-list
			id="fileEquipment-attributes"
			class="inspector-list"
			group="equipment"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileEquipment-events') || 'Events' }}</DetailSummary>
		<param-list
			id="fileEquipment-events"
			class="inspector-list"
			filter="equipment"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileEquipment-scripts') || 'Scripts' }}</DetailSummary>
		<param-list
			id="fileEquipment-scripts"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<parameter-pane id="fileEquipment-parameter-pane" />
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
