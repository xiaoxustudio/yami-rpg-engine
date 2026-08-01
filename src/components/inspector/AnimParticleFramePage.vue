<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('animParticleFrame-properties-grid') || 'Frame' }}</detail-summary>
		<detail-grid id="animParticleFrame-properties-grid">
			<text>{{ local.getLabel('animParticleFrame-position-box') || 'Position' }}</text>
			<box
				id="animParticleFrame-position-box"
				class="uiElement-grid-box with-2-columns"
			>
				<number-box
					id="animParticleFrame-x"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				></number-box>
				<number-box
					id="animParticleFrame-y"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				></number-box>
			</box>
			<text>{{ local.getLabel('animParticleFrame-rotation-box') || 'Rotation' }}</text>
			<box
				id="animParticleFrame-rotation-box"
				class="uiElement-grid-box with-2-columns"
			>
				<number-box
					id="animParticleFrame-rotation"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg"
				></number-box>
			</box>
			<text>{{ local.getLabel('animParticleFrame-scale-box') || 'Scale' }}</text>
			<box
				id="animParticleFrame-scale-box"
				class="uiElement-grid-box with-2-columns"
			>
				<number-box
					id="animParticleFrame-scaleX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				></number-box>
				<number-box
					id="animParticleFrame-scaleY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				></number-box>
			</box>
			<text>{{ local.getLabel('animParticleFrame-opacity-box') || 'Opacity' }}</text>
			<box
				id="animParticleFrame-opacity-box"
				class="uiElement-grid-box with-2-columns"
			>
				<number-box
					id="animParticleFrame-opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></number-box>
			</box>
			<text>{{ local.getLabel('animParticleFrame-scale') || 'Particle Scale' }}</text
			><number-box
				id="animParticleFrame-scale"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
			></number-box>
			<text>{{ local.getLabel('animParticleFrame-speed') || 'Speed' }}</text
			><number-box
				id="animParticleFrame-speed"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
			></number-box>
		</detail-grid>
	</detail-box>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAnimationStore } from '@app/stores/animation';
import { useLocalStore } from '@app/stores/local';

const animation = useAnimationStore();
const local = useLocalStore();

onMounted(() => {
	animation.syncState();
	local.syncState();
});
</script>
