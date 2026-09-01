<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileState-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="fileState-general-grid">
			<div class="text">{{ t('components.fileState-icon.label') || 'Icon' }}</div>
			<CustomBox
				id="fileState-icon"
				:model-value="form.icon"
				@input="onParamInput"
				type="file"
				filter="image"
			/>
			<div class="text">{{ t('components.fileState-clip.label') || 'Clip' }}</div>
			<CustomBox
				id="fileState-clip"
				:model-value="form.clip"
				@input="onParamInput"
				type="clip"
				image="fileState-icon"
			/>
			<div class="text">{{ t('components.fileState-inherit.label') || 'Inherit' }}</div>
			<CustomBox
				id="fileState-inherit"
				:model-value="form.inherit"
				@input="onParamInput"
				type="file"
				filter="state"
			/>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileState-attributes.label') || 'Attributes'
		}}</DetailSummary>
		<ParamList
			ref="elAttributes"
			id="fileState-attributes"
			@change="onListChange"
			class="inspector-list"
			group="state"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileState-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			ref="elEvents"
			id="fileState-events"
			@change="onListChange"
			class="inspector-list"
			filter="state"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileState-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList
			ref="elScripts"
			id="fileState-scripts"
			@change="onListChange"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<ParameterPane ref="elParameterPane" id="fileState-parameter-pane" />
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { AttributeListInterface } from '@app/tools/property-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import { useFileStatePage } from '@app/composables/useFileStatePage';
import { useInspectorStore } from '@app/stores/inspector';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';

const inspector = useInspectorStore();
const { t } = useI18n();

const { form, sync, onParamInput } = useFileStatePage();

const onListChange = () => {
	Inspector?.fileState?.listChange?.();
};

const elAttributes = ref<InstanceType<typeof ParamList> | null>(null);
const elEvents = ref<InstanceType<typeof ParamList> | null>(null);
const elScripts = ref<InstanceType<typeof ParamList> | null>(null);
const elParameterPane = ref<InstanceType<typeof ParameterPane> | null>(null);

onMounted(() => {
	const editor = Inspector.fileState;
	if (!editor) return;

	const el = document.getElementById('fileState-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	elAttributes.value?.bind(new AttributeListInterface());
	elEvents.value?.bind(new EventListInterface(editor));
	elScripts.value?.bind(new ScriptListInterface());
	elParameterPane.value?.bind(elScripts.value?.root as HTMLElement);

	sync();
});
</script>
