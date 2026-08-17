<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animSpriteLayer-properties-grid') || 'Sprite Layer' }}</DetailSummary>
		<div class="detail-grid" id="animSpriteLayer-properties-grid">
			<div class="text">{{ local.getLabel('animSpriteLayer-sprite') || 'Sprite' }}</div><SelectBox id="animSpriteLayer-sprite" v-model="form.sprite" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('animSpriteLayer-blend') || 'Blend' }}</div><SelectBox id="animSpriteLayer-blend" v-model="form.blend" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('animSpriteLayer-light') || 'Light Sampling' }}</div
			><SelectBox id="animSpriteLayer-light" v-model="form.light" @input="onParamInput"></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAnimSpriteLayerPage } from '@app/composables/useAnimSpriteLayerPage';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const local = useLocalStore();

const { form, sync, onParamInput } = useAnimSpriteLayerPage();

onMounted(() => {
	const el = document.getElementById('animSpriteLayer-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
