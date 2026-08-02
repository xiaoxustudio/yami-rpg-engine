<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animMotion-general-grid') || 'Motion' }}</DetailSummary>
		<detail-grid id="animMotion-general-grid">
			<text>{{ local.getLabel('animMotion-mode') || 'Direction' }}</text><select-box id="animMotion-mode"></select-box>
			<text>{{ local.getLabel('animMotion-skip') || 'Skip Last Frame' }}</text
			><check-box id="animMotion-skip" class="standard large"></check-box>
			<text>{{ local.getLabel('animMotion-loop') || 'Loop' }}</text
			><check-box id="animMotion-loop" class="standard large"></check-box>
			<text>{{ local.getLabel('animMotion-loopStart') || 'Loop Start' }}</text
			><number-box id="animMotion-loopStart" min="0" max="10000"></number-box>
		</detail-grid>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAnimationStore } from '@app/stores/animation';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';

const animation = useAnimationStore();
const local = useLocalStore();

onMounted(() => {
	animation.syncState();
	local.syncState();
});
</script>
