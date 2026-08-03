<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animJointFrame-properties-grid') || 'Frame' }}</DetailSummary>
		<div class="detail-grid" id="animJointFrame-properties-grid">
			<text>{{ local.getLabel('animJointFrame-position-box') || 'Position' }}</text>
			<div
				id="animJointFrame-position-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animJointFrame-x"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				></NumberBox>
				<NumberBox
					id="animJointFrame-y"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('animJointFrame-rotation-box') || 'Rotation' }}</text>
			<div
				id="animJointFrame-rotation-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animJointFrame-rotation"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('animJointFrame-scale-box') || 'Scale' }}</text>
			<div
				id="animJointFrame-scale-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animJointFrame-scaleX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				></NumberBox>
				<NumberBox
					id="animJointFrame-scaleY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('animJointFrame-opacity-box') || 'Opacity' }}</text>
			<div
				id="animJointFrame-opacity-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animJointFrame-opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
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
