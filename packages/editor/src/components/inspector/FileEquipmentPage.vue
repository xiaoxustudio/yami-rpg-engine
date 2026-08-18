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
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { EventListInterface } from '@app/legacy/tools/event-list.ts';
import { AttributeListInterface } from '@app/legacy/tools/property-list.ts';
import { ScriptListInterface } from '@app/legacy/tools/script-list.ts';
import { useFileEquipmentPage } from '@app/composables/useFileEquipmentPage';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
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
	const editor = Inspector.fileEquipment;
	if (!editor) return;

	const el = document.getElementById('fileEquipment-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	document.getElementById('fileEquipment-attributes')?.bind?.(new AttributeListInterface());
	document.getElementById('fileEquipment-events')?.bind?.(new EventListInterface(editor));
	document.getElementById('fileEquipment-scripts')?.bind?.(new ScriptListInterface());
	document.getElementById('fileEquipment-parameter-pane')?.bind?.(document.getElementById('fileEquipment-scripts'));

	sync();
});
</script>
