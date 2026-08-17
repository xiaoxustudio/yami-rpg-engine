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
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const local = useLocalStore();

const { form, sync, onParamInput } = useUIReferencePage();

onMounted(() => {
	const el = document.getElementById('uiReference-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
