<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animSoundFrame-properties-grid') || 'Frame' }}</DetailSummary>
		<div class="detail-grid" id="animSoundFrame-properties-grid">
			<div class="text">{{ local.getLabel('animSoundFrame-sound') || 'Sound' }}</div
			><CustomBox
				id="animSoundFrame-sound"
				:model-value="form.sound"
				type="file"
				filter="audio"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ local.getLabel('animSoundFrame-volume') || 'Volume' }}</div
			><NumberBox
				id="animSoundFrame-volume"
				v-model="form.volume"
				min="0"
				max="1"
				step="0.1"
				decimals="4" @input="onParamInput"
			></NumberBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAnimSoundFramePage } from '@app/composables/useAnimSoundFramePage';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const local = useLocalStore();

const { form, sync, onParamInput } = useAnimSoundFramePage();

onMounted(() => {
	const el = document.getElementById('animSoundFrame-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
