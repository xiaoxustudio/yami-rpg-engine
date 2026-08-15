<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animParticleLayer-properties-grid') || 'Particle Layer' }}</DetailSummary>
		<div class="detail-grid" id="animParticleLayer-properties-grid">
			<div class="text">{{ local.getLabel('animParticleLayer-particleId') || 'Particle' }}</div
			><CustomBox
				id="animParticleLayer-particleId"
				type="file"
				filter="particle"
				:model-value="form.particleId"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ local.getLabel('animParticleLayer-position') || 'Position' }}</div
			><SelectBox id="animParticleLayer-position" v-model="form.position" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('animParticleLayer-angle') || 'Angle' }}</div><SelectBox id="animParticleLayer-angle" v-model="form.angle" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('animParticleLayer-order') || 'Order' }}</div><SelectBox id="animParticleLayer-order" v-model="form.order" @input="onParamInput"></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAnimParticleLayerPage } from '@app/composables/useAnimParticleLayerPage';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const local = useLocalStore();

const { form, sync, onParamInput } = useAnimParticleLayerPage();

onMounted(() => {
	const el = document.getElementById('animParticleLayer-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
