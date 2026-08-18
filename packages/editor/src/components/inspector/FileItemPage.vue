<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileItem-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="fileItem-general-grid">
			<div class="text">{{ local.getLabel('fileItem-icon') || 'Icon' }}</div
			><CustomBox id="fileItem-icon" :model-value="form.icon" @input="onParamInput" type="file" filter="image" />
			<div class="text">{{ local.getLabel('fileItem-clip') || 'Clip' }}</div
			><CustomBox id="fileItem-clip" :model-value="form.clip" @input="onParamInput" type="clip" image="fileItem-icon" />
			<div class="text">{{ local.getLabel('fileItem-inherit') || 'Inherit' }}</div
			><CustomBox id="fileItem-inherit" :model-value="form.inherit" @input="onParamInput" type="file" filter="item" />
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileItem-attributes') || 'Attributes' }}</DetailSummary>
		<ParamList
			id="fileItem-attributes" @change="onListChange"
			class="inspector-list"
			group="item"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileItem-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="fileItem-events" @change="onListChange"
			class="inspector-list"
			filter="item"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileItem-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="fileItem-scripts" @change="onListChange"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<ParameterPane id="fileItem-parameter-pane" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { EventListInterface } from '@app/legacy/tools/event-list.ts';
import { AttributeListInterface } from '@app/legacy/tools/property-list.ts';
import { ScriptListInterface } from '@app/legacy/tools/script-list.ts';
import { useFileItemPage } from '@app/composables/useFileItemPage';
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

const { form, sync, onParamInput } = useFileItemPage();

const onListChange = () => {
	Inspector?.fileItem?.listChange?.();
};

onMounted(() => {
	const editor = Inspector.fileItem;
	if (!editor) return;

	const el = document.getElementById('fileItem-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	document.getElementById('fileItem-attributes')?.bind?.(new AttributeListInterface());
	document.getElementById('fileItem-events')?.bind?.(new EventListInterface(editor));
	document.getElementById('fileItem-scripts')?.bind?.(new ScriptListInterface());
	document.getElementById('fileItem-parameter-pane')?.bind?.(document.getElementById('fileItem-scripts'));

	sync();
});
</script>
