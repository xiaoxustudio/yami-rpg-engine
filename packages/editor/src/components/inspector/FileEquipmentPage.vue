<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileEquipment-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="fileEquipment-general-grid">
			<div class="text">{{ t('components.fileEquipment-icon.label') || 'Icon' }}</div>
			<CustomBox
				id="fileEquipment-icon"
				:model-value="form.icon"
				@input="onParamInput"
				type="file"
				filter="image"
			/>
			<div class="text">{{ t('components.fileEquipment-clip.label') || 'Clip' }}</div>
			<CustomBox
				id="fileEquipment-clip"
				:model-value="form.clip"
				@input="onParamInput"
				type="clip"
				image="fileEquipment-icon"
			/>
			<div class="text">{{ t('components.fileEquipment-inherit.label') || 'Inherit' }}</div>
			<CustomBox
				id="fileEquipment-inherit"
				:model-value="form.inherit"
				@input="onParamInput"
				type="file"
				filter="equipment"
			/>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileEquipment-attributes.label') || 'Attributes'
		}}</DetailSummary>
		<ParamList
			ref="elAttributes"
			id="fileEquipment-attributes"
			@change="onListChange"
			class="inspector-list"
			group="equipment"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileEquipment-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			ref="elEvents"
			id="fileEquipment-events"
			@change="onListChange"
			class="inspector-list"
			filter="equipment"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileEquipment-scripts.label') || 'Scripts'
		}}</DetailSummary>
		<ParamList
			ref="elScripts"
			id="fileEquipment-scripts"
			@change="onListChange"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<ParameterPane ref="elParameterPane" id="fileEquipment-parameter-pane" />
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { AttributeListInterface } from '@app/tools/property-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import { useFileEquipmentPage } from '@app/composables/useFileEquipmentPage';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useFileEquipmentPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const onListChange = () => {
	Inspector?.fileEquipment?.listChange?.();
};

const elAttributes = ref<InstanceType<typeof ParamList> | null>(null);
const elEvents = ref<InstanceType<typeof ParamList> | null>(null);
const elScripts = ref<InstanceType<typeof ParamList> | null>(null);
const elParameterPane = ref<InstanceType<typeof ParameterPane> | null>(null);

onMounted(() => {
	const editor = Inspector.fileEquipment;
	if (!editor) return;

	const el = document.getElementById('fileEquipment-vue-mount');
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
