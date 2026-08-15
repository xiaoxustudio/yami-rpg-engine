<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileEvent-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="fileEvent-general-grid">
			<div class="text">{{ local.getLabel('fileEvent-type') || 'Type' }}</div><SelectBox id="fileEvent-type" :model-value="form.type" @input="onParamInput" @write="onTypeWrite" />
			<div class="text">{{ local.getLabel('fileEvent-enabled') || 'Enabled' }}</div
			><CheckBox id="fileEvent-enabled" class="standard large" :model-value="form.enabled" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileEvent-priority') || 'Priority' }}</div
			><CheckBox id="fileEvent-priority" class="standard large" :model-value="form.priority" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileEvent-namespace') || 'Namespace' }}</div
			><CheckBox id="fileEvent-namespace" class="standard large" :model-value="form.namespace" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileEvent-returnType') || 'Return Type' }}</div
			><SelectBox id="fileEvent-returnType" :model-value="form.returnType" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileEvent-description') || 'Description' }}</div><TextArea id="fileEvent-description" :model-value="form.description" @input="onParamInput" />
		</div>
		<DetailBox open>
			<DetailSummary>{{ local.getLabel('fileEvent-parameters') || 'Parameters' }}</DetailSummary>
			<ParamList
				id="fileEvent-parameters"
				class="inspector-list"
				flexible
			/>
		</DetailBox>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { useFileEventPage } from '@app/composables/useFileEventPage';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const { form, sync, onParamInput } = useFileEventPage();

const onTypeWrite = (value: unknown) => {
	Inspector?.fileEvent?.typeWrite?.({ value });
};

onMounted(() => {
	const el = document.getElementById('fileEvent-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
