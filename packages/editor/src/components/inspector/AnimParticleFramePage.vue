<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animParticleFrame-properties-grid') || 'Frame' }}</DetailSummary>
		<div class="detail-grid" id="animParticleFrame-properties-grid">
			<div class="text">{{ local.getLabel('animParticleFrame-position-box') || 'Position' }}</div>
			<div
				id="animParticleFrame-position-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animParticleFrame-x"
					v-model="form.x"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animParticleFrame-y"
					v-model="form.y"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('animParticleFrame-rotation-box') || 'Rotation' }}</div>
			<div
				id="animParticleFrame-rotation-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animParticleFrame-rotation"
					v-model="form.rotation"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('animParticleFrame-scale-box') || 'Scale' }}</div>
			<div
				id="animParticleFrame-scale-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animParticleFrame-scaleX"
					v-model="form.scaleX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animParticleFrame-scaleY"
					v-model="form.scaleY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('animParticleFrame-opacity-box') || 'Opacity' }}</div>
			<div
				id="animParticleFrame-opacity-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animParticleFrame-opacity"
					v-model="form.opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('animParticleFrame-scale') || 'Particle Scale' }}</div
			><NumberBox
				id="animParticleFrame-scale"
				v-model="form.scale"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('animParticleFrame-speed') || 'Speed' }}</div
			><NumberBox
				id="animParticleFrame-speed"
				v-model="form.speed"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4" @input="onParamInput"
			></NumberBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAnimParticleFramePage } from '@app/composables/useAnimParticleFramePage';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const local = useLocalStore();

const { form, sync, onParamInput } = useAnimParticleFramePage();

onMounted(() => {
	const el = document.getElementById('animParticleFrame-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
