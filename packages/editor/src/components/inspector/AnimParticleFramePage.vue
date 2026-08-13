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
					min="-10000"
					max="10000"
					decimals="4"
					unit="px" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animParticleFrame-y"
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
					min="-100"
					max="100"
					step="0.1"
					decimals="4" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animParticleFrame-scaleY"
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
					min="0"
					max="1"
					step="0.05"
					decimals="4" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('animParticleFrame-scale') || 'Particle Scale' }}</div
			><NumberBox
				id="animParticleFrame-scale"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('animParticleFrame-speed') || 'Speed' }}</div
			><NumberBox
				id="animParticleFrame-speed"
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
import { Inspector } from '@/inspector/inspector.ts';
import { useAnimationStore } from '@app/stores/animation';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const animation = useAnimationStore();
const local = useLocalStore();

const onParamInput = (event: Event) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.animParticleFrame?.paramInput?.({ target });
};

onMounted(() => {
	animation.syncState();
	local.syncState();
});
</script>
