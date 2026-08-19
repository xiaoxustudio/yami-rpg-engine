<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileEvent-general-grid.label') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="fileEvent-general-grid">
			<div class="text">{{ t('components.fileEvent-type.label') || 'Type' }}</div><SelectBox id="fileEvent-type" :model-value="form.type" @input="onParamInput" @write="onTypeWrite" />
			<div class="text">{{ t('components.fileEvent-enabled.label') || 'Enabled' }}</div
			><CheckBox id="fileEvent-enabled" class="standard large" :model-value="form.enabled" @input="onParamInput" />
			<div class="text">{{ t('components.fileEvent-priority.label') || 'Priority' }}</div
			><CheckBox id="fileEvent-priority" class="standard large" :model-value="form.priority" @input="onParamInput" />
			<div class="text">{{ t('components.fileEvent-namespace.label') || 'Namespace' }}</div
			><CheckBox id="fileEvent-namespace" class="standard large" :model-value="form.namespace" @input="onParamInput" />
			<div class="text">{{ t('components.fileEvent-returnType.label') || 'Return Type' }}</div
			><SelectBox id="fileEvent-returnType" :model-value="form.returnType" @input="onParamInput" />
			<div class="text">{{ t('components.fileEvent-description.label') || 'Description' }}</div><TextArea id="fileEvent-description" :model-value="form.description" @input="onParamInput" />
		</div>
		<DetailBox open>
			<DetailSummary>{{ t('components.fileEvent-parameters.label') || 'Parameters' }}</DetailSummary>
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
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { EventEditor } from '@app/legacy/command/event-editor.ts';
import { useFileEventPage } from '@app/composables/useFileEventPage';
import { useInspectorStore } from '@app/stores/inspector';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const { t } = useI18n();

const { form, sync, onParamInput } = useFileEventPage();

const onTypeWrite = (value: unknown) => {
	Inspector?.fileEvent?.typeWrite?.({ value });
};

onMounted(() => {
	const editor = Inspector.fileEvent;
	if (!editor) return;

	const el = document.getElementById('fileEvent-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	if (EventEditor.types) {
		const elType = document.getElementById('fileEvent-type') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
		if (elType?.loadItems) {
			elType.loadItems(EventEditor.types.global);
		}
		EventEditor.types.relatedElements.push(document.getElementById('fileEvent-type'));
	}

	const elReturnType = document.getElementById('fileEvent-returnType') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
	if (elReturnType?.loadItems) {
		elReturnType.loadItems([
			{ name: 'None', value: 'none' },
			{ name: 'Boolean', value: 'boolean' },
			{ name: 'Number', value: 'number' },
			{ name: 'String', value: 'string' },
			{ name: 'Object', value: 'object' },
			{ name: 'Actor', value: 'actor' },
			{ name: 'Skill', value: 'skill' },
			{ name: 'State', value: 'state' },
			{ name: 'Equipment', value: 'equipment' },
			{ name: 'Item', value: 'item' },
			{ name: 'Trigger', value: 'trigger' },
			{ name: 'Light', value: 'light' },
			{ name: 'Element', value: 'element' }
		]);
	}

	document.getElementById('fileEvent-parameters')?.bind?.(editor.parameters);
	document.getElementById('fileEvent-parameters')?.on?.('change', editor.listChange);

	sync();
});
</script>
