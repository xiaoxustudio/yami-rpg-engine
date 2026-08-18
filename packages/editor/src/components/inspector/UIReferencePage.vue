<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiReference-properties-grid') || 'Reference Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiReference-properties-grid">
			<div class="text">{{ local.getLabel('uiReference-prefabId') || 'Prefab' }}</div
			><CustomBox
				id="uiReference-prefabId"
				:model-value="form.prefabId"
				type="preset-element"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ local.getLabel('uiReference-synchronous') || 'Synchronous' }}</div
			><CheckBox
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
import { useUIReferencePage } from '@app/composables/useUIReferencePage';
import { useLocalStore } from '@app/stores/local';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { UI } from '@app/legacy/ui/ui-window.ts';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const local = useLocalStore();

const { form, sync, onParamInput } = useUIReferencePage();

onMounted(() => {
	const uiReference = Inspector.uiReference;
	if (uiReference) {
		const elements = document.querySelectorAll(
			'#uiReference-prefabId, #uiReference-synchronous'
		);
		(elements as unknown as HTMLElement[]).forEach((el: HTMLElement) =>
			el.addEventListener('focus', Inspector.inputFocus)
		);
		if (Inspector.inputBlur) {
			(elements as unknown as HTMLElement[]).forEach((el: HTMLElement) =>
				el.addEventListener('blur', Inspector.inputBlur!(uiReference, UI))
			);
		}
	}
	const el = document.getElementById('uiReference-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
