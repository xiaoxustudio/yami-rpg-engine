<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileSkill-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="fileSkill-general-grid">
			<div class="text">{{ t('components.fileSkill-icon.label') || 'Icon' }}</div>
			<CustomBox
				id="fileSkill-icon"
				:model-value="form.icon"
				@input="onParamInput"
				type="file"
				filter="image"
			/>
			<div class="text">{{ t('components.fileSkill-clip.label') || 'Clip' }}</div>
			<CustomBox
				id="fileSkill-clip"
				:model-value="form.clip"
				@input="onParamInput"
				type="clip"
				image="fileSkill-icon"
			/>
			<div class="text">{{ t('components.fileSkill-inherit.label') || 'Inherit' }}</div>
			<CustomBox
				id="fileSkill-inherit"
				:model-value="form.inherit"
				@input="onParamInput"
				type="file"
				filter="skill"
			/>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileSkill-attributes.label') || 'Attributes'
		}}</DetailSummary>
		<ParamList
			id="fileSkill-attributes"
			@change="onListChange"
			class="inspector-list"
			group="skill"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileSkill-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="fileSkill-events"
			@change="onListChange"
			class="inspector-list"
			filter="skill"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileSkill-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList id="fileSkill-scripts" @change="onListChange" class="inspector-list" flexible />
	</DetailBox>
	<ParameterPane id="fileSkill-parameter-pane" />
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { AttributeListInterface } from '@app/tools/property-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import { useFileSkillPage } from '@app/composables/useFileSkillPage';
import { useInspectorStore } from '@app/stores/inspector';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';

const inspector = useInspectorStore();
const { t } = useI18n();

const { form, sync, onParamInput } = useFileSkillPage();

const onListChange = () => {
	Inspector?.fileSkill?.listChange?.();
};

onMounted(() => {
	const editor = Inspector.fileSkill;
	if (!editor) return;

	const el = document.getElementById('fileSkill-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	document.getElementById('fileSkill-attributes')?.bind?.(new AttributeListInterface());
	document.getElementById('fileSkill-events')?.bind?.(new EventListInterface(editor));
	document.getElementById('fileSkill-scripts')?.bind?.(new ScriptListInterface());
	document
		.getElementById('fileSkill-parameter-pane')
		?.bind?.(document.getElementById('fileSkill-scripts'));

	sync();
});
</script>
