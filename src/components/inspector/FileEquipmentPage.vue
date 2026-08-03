<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileEquipment-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="fileEquipment-general-grid">
			<text>{{ local.getLabel('fileEquipment-icon') || 'Icon' }}</text
			><CustomBox id="fileEquipment-icon" type="file" filter="image" />
			<text>{{ local.getLabel('fileEquipment-clip') || 'Clip' }}</text
			><CustomBox
				id="fileEquipment-clip"
				type="clip"
				image="fileEquipment-icon"
			/>
			<text>{{ local.getLabel('fileEquipment-inherit') || 'Inherit' }}</text
			><CustomBox
				id="fileEquipment-inherit"
				type="file"
				filter="equipment"
			/>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileEquipment-attributes') || 'Attributes' }}</DetailSummary>
		<ParamList
			id="fileEquipment-attributes"
			class="inspector-list"
			group="equipment"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileEquipment-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="fileEquipment-events"
			class="inspector-list"
			filter="equipment"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileEquipment-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="fileEquipment-scripts"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<ParameterPane id="fileEquipment-parameter-pane" />
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
