<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animParticleFrame-properties-grid') || 'Frame' }}</DetailSummary>
		<div class="detail-grid" id="animParticleFrame-properties-grid">
			<text>{{ local.getLabel('animParticleFrame-position-box') || 'Position' }}</text>
			<div
				id="animParticleFrame-position-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animParticleFrame-x"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				></NumberBox>
				<NumberBox
					id="animParticleFrame-y"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('animParticleFrame-rotation-box') || 'Rotation' }}</text>
			<div
				id="animParticleFrame-rotation-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animParticleFrame-rotation"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('animParticleFrame-scale-box') || 'Scale' }}</text>
			<div
				id="animParticleFrame-scale-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animParticleFrame-scaleX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				></NumberBox>
				<NumberBox
					id="animParticleFrame-scaleY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('animParticleFrame-opacity-box') || 'Opacity' }}</text>
			<div
				id="animParticleFrame-opacity-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animParticleFrame-opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('animParticleFrame-scale') || 'Particle Scale' }}</text
			><NumberBox
				id="animParticleFrame-scale"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('animParticleFrame-speed') || 'Speed' }}</text
			><NumberBox
				id="animParticleFrame-speed"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
			></NumberBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAnimationStore } from '@app/stores/animation';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const animation = useAnimationStore();
const local = useLocalStore();

onMounted(() => {
	animation.syncState();
	local.syncState();
});
</script>
