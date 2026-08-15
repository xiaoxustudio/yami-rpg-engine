<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animSoundLayer-properties-grid') || 'Sound Layer' }}</DetailSummary>
		<div class="detail-grid" id="animSoundLayer-properties-grid">
			<div class="text">{{ local.getLabel('animSoundLayer-playbackRate') || 'Playback Rate' }}</div
			><SelectBox id="animSoundLayer-playbackRate" v-model="form.playbackRate" @input="onParamInput"></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAnimSoundLayerPage } from '@app/composables/useAnimSoundLayerPage';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const local = useLocalStore();

const { form, sync, onParamInput } = useAnimSoundLayerPage();

onMounted(() => {
	const el = document.getElementById('animSoundLayer-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
