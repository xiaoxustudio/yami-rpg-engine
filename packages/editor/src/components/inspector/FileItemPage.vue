<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileItem-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="fileItem-general-grid">
			<div class="text">{{ t('components.fileItem-icon.label') || 'Icon' }}</div>
			<CustomBox
				id="fileItem-icon"
				v-tip="t('components.fileItem-icon.tip')"
				:model-value="form.icon"
				@input="onParamInput"
				type="file"
				filter="image"
			/>
			<div class="text">{{ t('components.fileItem-clip.label') || 'Clip' }}</div>
			<CustomBox
				id="fileItem-clip"
				v-tip="t('components.fileItem-clip.tip')"
				:model-value="form.clip"
				@input="onParamInput"
				type="clip"
				image="fileItem-icon"
			/>
			<div class="text">{{ t('components.fileItem-inherit.label') || 'Inherit' }}</div>
			<CustomBox
				id="fileItem-inherit"
				v-tip="t('components.fileItem-inherit.tip')"
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
			ref="elAttributes"
			id="fileItem-attributes"
				v-tip="t('components.fileItem-attributes.tip')"
			@change="onListChange"
			class="inspector-list"
			group="item"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileItem-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			ref="elEvents"
			id="fileItem-events"
				v-tip="t('components.fileItem-events.tip')"
			@change="onListChange"
			class="inspector-list"
			filter="item"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileItem-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList
			ref="elScripts"
			id="fileItem-scripts"
				v-tip="t('components.fileItem-scripts.tip')"
			@change="onListChange"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<ParameterPane ref="elParameterPane" id="fileItem-parameter-pane" />
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { AttributeListInterface } from '@app/tools/property-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import { useFileItemPage } from '@app/composables/useFileItemPage';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useFileItemPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const onListChange = () => {
	Inspector?.fileItem?.listChange?.();
};

const elAttributes = ref<InstanceType<typeof ParamList> | null>(null);
const elEvents = ref<InstanceType<typeof ParamList> | null>(null);
const elScripts = ref<InstanceType<typeof ParamList> | null>(null);
const elParameterPane = ref<InstanceType<typeof ParameterPane> | null>(null);

onMounted(() => {
	const editor = Inspector.fileItem;
	if (!editor) return;

	const el = document.getElementById('fileItem-vue-mount');
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
