<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileEvent-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="fileEvent-general-grid">
			<div class="text">{{ t('components.fileEvent-type.label') || 'Type' }}</div>
			<SelectBox
				ref="elType"
				id="fileEvent-type"
				v-tip="t('components.fileEvent-type.tip')"
				v-model="form.type"
				@input="onParamInput"
				@write="onTypeWrite"
			/>
			<div class="text">{{ t('components.fileEvent-enabled.label') || 'Enabled' }}</div>
			<CheckBox
				id="fileEvent-enabled"
				v-tip="t('components.fileEvent-enabled.tip')"
				:ref="registryRef(inspectorEls, 'fileEvent-enabled')"
				class="standard large"
				v-model="form.enabled"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileEvent-priority.label') || 'Priority' }}</div>
			<CheckBox
				id="fileEvent-priority"
				v-tip="t('components.fileEvent-priority.tip')"
				:ref="registryRef(inspectorEls, 'fileEvent-priority')"
				class="standard large"
				v-model="form.priority"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileEvent-namespace.label') || 'Namespace' }}</div>
			<CheckBox
				id="fileEvent-namespace"
				v-tip="t('components.fileEvent-namespace.tip')"
				class="standard large"
				v-model="form.namespace"
				@input="onParamInput"
			/>
			<div class="text">
				{{ t('components.fileEvent-returnType.label') || 'Return Type' }}
			</div>
			<SelectBox
				ref="elReturnType"
				id="fileEvent-returnType"
				v-tip="t('components.fileEvent-returnType.tip')"
				v-model="form.returnType"
				@input="onParamInput"
			/>
			<div class="text">
				{{ t('components.fileEvent-description.label') || 'Description' }}
			</div>
			<TextArea id="fileEvent-description"
				v-tip="t('components.fileEvent-description.tip')" v-model="form.description" @input="onParamInput" />
		</div>
		<DetailBox open>
			<DetailSummary>{{
				t('components.fileEvent-parameters.label') || 'Parameters'
			}}</DetailSummary>
			<ParamList
				ref="elParameters"
				id="fileEvent-parameters"
				v-tip="t('components.fileEvent-parameters.tip')"
				class="inspector-list"
				flexible
			/>
		</DetailBox>
	</DetailBox>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, ref, watch } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryRef, registerElement } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { EventEditor } from '@app/commands/event-editor.ts';
import { useFileEventPage } from '@app/composables/useFileEventPage';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useFileEventPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const onTypeWrite = (value: unknown) => {
	Inspector?.fileEvent?.typeWrite?.({ value });
};

watch(
	() => form.type,
	(value) => {
		Inspector?.fileEvent?.typeWrite?.({ value });
	}
);

const elType = ref<InstanceType<typeof SelectBox> | null>(null);
const elReturnType = ref<InstanceType<typeof SelectBox> | null>(null);
const elParameters = ref<InstanceType<typeof ParamList> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'fileEvent-type', elType.value);
	registerElement(inspectorEls, 'fileEvent-parameters', elParameters.value);
	const editor = Inspector.fileEvent;
	if (!editor) return;

	const el = document.getElementById('fileEvent-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	if (EventEditor.types) {
		elType.value?.loadItems(EventEditor.types.global);
		EventEditor.types.relatedElements.push(elType.value?.root ?? null);
	}

	elReturnType.value?.loadItems([
		{ name: t('components.fileEvent-returnType.options.none.name'), tip: t('components.fileEvent-returnType.options.none.tip'), value: 'none'  },
		{ name: t('components.fileEvent-returnType.options.boolean.name'), tip: t('components.fileEvent-returnType.options.boolean.tip'), value: 'boolean'  },
		{ name: t('components.fileEvent-returnType.options.number.name'), tip: t('components.fileEvent-returnType.options.number.tip'), value: 'number'  },
		{ name: t('components.fileEvent-returnType.options.string.name'), tip: t('components.fileEvent-returnType.options.string.tip'), value: 'string'  },
		{ name: t('components.fileEvent-returnType.options.object.name'), tip: t('components.fileEvent-returnType.options.object.tip'), value: 'object'  },
		{ name: t('components.fileEvent-returnType.options.actor.name'), tip: t('components.fileEvent-returnType.options.actor.tip'), value: 'actor'  },
		{ name: t('components.fileEvent-returnType.options.skill.name'), tip: t('components.fileEvent-returnType.options.skill.tip'), value: 'skill'  },
		{ name: t('components.fileEvent-returnType.options.state.name'), tip: t('components.fileEvent-returnType.options.state.tip'), value: 'state'  },
		{ name: t('components.fileEvent-returnType.options.equipment.name'), tip: t('components.fileEvent-returnType.options.equipment.tip'), value: 'equipment'  },
		{ name: t('components.fileEvent-returnType.options.item.name'), tip: t('components.fileEvent-returnType.options.item.tip'), value: 'item'  },
		{ name: t('components.fileEvent-returnType.options.trigger.name'), tip: t('components.fileEvent-returnType.options.trigger.tip'), value: 'trigger'  },
		{ name: t('components.fileEvent-returnType.options.light.name'), tip: t('components.fileEvent-returnType.options.light.tip'), value: 'light'  },
		{ name: t('components.fileEvent-returnType.options.element.name'), tip: t('components.fileEvent-returnType.options.element.tip'), value: 'element'  }
	]);

	elParameters.value?.bind(editor.parameters);
	elParameters.value?.on('change', editor.listChange);

	sync();
});
</script>

<style>
/* 样式迁移：由 Project/css/inspector.css 迁入组件（选择器为全局 id，不能用 scoped） */
#fileEvent-description {
	height: 92px;
}
</style>

