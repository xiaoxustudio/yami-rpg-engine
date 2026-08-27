<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiReference-properties-grid.label') || 'Reference Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiReference-properties-grid">
			<div class="text">{{ t('components.uiReference-prefabId.label') || 'Prefab' }}</div>
			<CustomBox
				id="uiReference-prefabId"
				:model-value="form.prefabId"
				type="preset-element"
				@input="onParamInput"
			></CustomBox>
			<div class="text">
				{{ t('components.uiReference-synchronous.label') || 'Synchronous' }}
			</div>
			<CheckBox
				id="uiReference-synchronous"
				:model-value="form.synchronous"
				class="standard large"
				@input="onParamInput"
			></CheckBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUIReferencePage } from '@app/composables/useUIReferencePage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { UI } from '@app/ui/ui-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput } = useUIReferencePage();

const { bindInput } = useInspectorInput();

onMounted(() => {
	const uiReference = Inspector.uiReference;
	if (uiReference) {
		const elements = document.querySelectorAll(
			'#uiReference-prefabId, #uiReference-synchronous'
		);
		bindInput(elements, uiReference, UI);
	}
	const el = document.getElementById('uiReference-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
