<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileItem-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="fileItem-general-grid">
			<div class="text">{{ t('components.fileItem-icon.label') || 'Icon' }}</div>
			<CustomBox
				id="fileItem-icon"
				:model-value="form.icon"
				@input="onParamInput"
				type="file"
				filter="image"
			/>
			<div class="text">{{ t('components.fileItem-clip.label') || 'Clip' }}</div>
			<CustomBox
				id="fileItem-clip"
				:model-value="form.clip"
				@input="onParamInput"
				type="clip"
				image="fileItem-icon"
			/>
			<div class="text">{{ t('components.fileItem-inherit.label') || 'Inherit' }}</div>
			<CustomBox
				id="fileItem-inherit"
				:model-value="form.inherit"
				@input="onParamInput"
				type="file"
				filter="item"
			/>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileItem-attributes.label') || 'Attributes'
		}}</DetailSummary>
		<ParamList
			id="fileItem-attributes"
			@change="onListChange"
			class="inspector-list"
			group="item"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileItem-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="fileItem-events"
			@change="onListChange"
			class="inspector-list"
			filter="item"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileItem-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList id="fileItem-scripts" @change="onListChange" class="inspector-list" flexible />
	</DetailBox>
	<ParameterPane id="fileItem-parameter-pane" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { AttributeListInterface } from '@app/tools/property-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import { useFileItemPage } from '@app/composables/useFileItemPage';
import { useInspectorStore } from '@app/stores/inspector';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';

const inspector = useInspectorStore();
const { t } = useI18n();

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
	document
		.getElementById('fileItem-parameter-pane')
		?.bind?.(document.getElementById('fileItem-scripts'));

	sync();
});
</script>
