<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiReference-properties-grid.label') || 'Reference Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiReference-properties-grid">
			<div class="text">{{ t('components.uiReference-prefabId.label') || 'Prefab' }}</div>
			<CustomBox
				id="uiReference-prefabId"
				v-tip="t('components.uiReference-prefabId.tip')"
				ref="elPrefabId"
				:model-value="form.prefabId"
				type="preset-element"
				@input="onParamInput"
			></CustomBox>
			<div class="text">
				{{ t('components.uiReference-synchronous.label') || 'Synchronous' }}
			</div>
			<CheckBox
				id="uiReference-synchronous"
				v-tip="t('components.uiReference-synchronous.tip')"
				ref="elSynchronous"
				:model-value="form.synchronous"
				class="standard large"
				@input="onParamInput"
			></CheckBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { useUIReferencePage } from '@app/composables/useUIReferencePage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useUIReferencePage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

const { bindInput } = useInspectorInput();

const elPrefabId = ref<InstanceType<typeof CustomBox> | null>(null);
const elSynchronous = ref<InstanceType<typeof CheckBox> | null>(null);

onMounted(() => {
	const uiReference = Inspector.uiReference;
	if (uiReference) {
		const elements = [elPrefabId.value?.root, elSynchronous.value?.root].filter(
			(el): el is HTMLElement => el != null
		);
		bindInput(elements, getUIStore(), uiReference);
	}
	const el = inspectorEls.get('uiReference-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
