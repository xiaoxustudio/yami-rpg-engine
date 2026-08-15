<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileState-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="fileState-general-grid">
			<div class="text">{{ local.getLabel('fileState-icon') || 'Icon' }}</div
			><CustomBox id="fileState-icon" :model-value="form.icon" @input="onParamInput" type="file" filter="image" />
			<div class="text">{{ local.getLabel('fileState-clip') || 'Clip' }}</div
			><CustomBox id="fileState-clip" :model-value="form.clip" @input="onParamInput" type="clip" image="fileState-icon" />
			<div class="text">{{ local.getLabel('fileState-inherit') || 'Inherit' }}</div
			><CustomBox id="fileState-inherit" :model-value="form.inherit" @input="onParamInput" type="file" filter="state" />
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileState-attributes') || 'Attributes' }}</DetailSummary>
		<ParamList
			id="fileState-attributes" @change="onListChange"
			class="inspector-list"
			group="state"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileState-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="fileState-events" @change="onListChange"
			class="inspector-list"
			filter="state"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileState-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="fileState-scripts" @change="onListChange"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<ParameterPane id="fileState-parameter-pane" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { useFileStatePage } from '@app/composables/useFileStatePage';
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

const { form, sync, onParamInput } = useFileStatePage();

const onListChange = () => {
	Inspector?.fileState?.listChange?.();
};

onMounted(() => {
	const el = document.getElementById('fileState-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
