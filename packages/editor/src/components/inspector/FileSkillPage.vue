<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileSkill-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="fileSkill-general-grid">
			<div class="text">{{ local.getLabel('fileSkill-icon') || 'Icon' }}</div
			><CustomBox id="fileSkill-icon" :model-value="form.icon" @input="onParamInput" type="file" filter="image" />
			<div class="text">{{ local.getLabel('fileSkill-clip') || 'Clip' }}</div
			><CustomBox id="fileSkill-clip" :model-value="form.clip" @input="onParamInput" type="clip" image="fileSkill-icon" />
			<div class="text">{{ local.getLabel('fileSkill-inherit') || 'Inherit' }}</div
			><CustomBox id="fileSkill-inherit" :model-value="form.inherit" @input="onParamInput" type="file" filter="skill" />
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileSkill-attributes') || 'Attributes' }}</DetailSummary>
		<ParamList
			id="fileSkill-attributes" @change="onListChange"
			class="inspector-list"
			group="skill"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileSkill-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="fileSkill-events" @change="onListChange"
			class="inspector-list"
			filter="skill"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileSkill-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="fileSkill-scripts" @change="onListChange"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<ParameterPane id="fileSkill-parameter-pane" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { useFileSkillPage } from '@app/composables/useFileSkillPage';
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

const { form, sync, onParamInput } = useFileSkillPage();

const onListChange = () => {
	Inspector?.fileSkill?.listChange?.();
};

onMounted(() => {
	const el = document.getElementById('fileSkill-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
