<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileEquipment-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="fileEquipment-general-grid">
			<div class="text">{{ local.getLabel('fileEquipment-icon') || 'Icon' }}</div
			><CustomBox id="fileEquipment-icon" :model-value="form.icon" @input="onParamInput" type="file" filter="image" />
			<div class="text">{{ local.getLabel('fileEquipment-clip') || 'Clip' }}</div
			><CustomBox id="fileEquipment-clip" :model-value="form.clip" @input="onParamInput" type="clip" image="fileEquipment-icon" />
			<div class="text">{{ local.getLabel('fileEquipment-inherit') || 'Inherit' }}</div
			><CustomBox id="fileEquipment-inherit" :model-value="form.inherit" @input="onParamInput" type="file" filter="equipment" />
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileEquipment-attributes') || 'Attributes' }}</DetailSummary>
		<ParamList
			id="fileEquipment-attributes" @change="onListChange"
			class="inspector-list"
			group="equipment"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileEquipment-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="fileEquipment-events" @change="onListChange"
			class="inspector-list"
			filter="equipment"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileEquipment-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="fileEquipment-scripts" @change="onListChange"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<ParameterPane id="fileEquipment-parameter-pane" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { useFileEquipmentPage } from '@app/composables/useFileEquipmentPage';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const { form, sync, onParamInput } = useFileEquipmentPage();

const onListChange = () => {
	Inspector?.fileEquipment?.listChange?.();
};

onMounted(() => {
	const el = document.getElementById('fileEquipment-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
