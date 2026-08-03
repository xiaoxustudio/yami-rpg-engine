<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animMotion-general-grid') || 'Motion' }}</DetailSummary>
		<div class="detail-grid" id="animMotion-general-grid">
			<text>{{ local.getLabel('animMotion-mode') || 'Direction' }}</text><SelectBox id="animMotion-mode"></SelectBox>
			<text>{{ local.getLabel('animMotion-skip') || 'Skip Last Frame' }}</text
			><CheckBox id="animMotion-skip" class="standard large"></CheckBox>
			<text>{{ local.getLabel('animMotion-loop') || 'Loop' }}</text
			><CheckBox id="animMotion-loop" class="standard large"></CheckBox>
			<text>{{ local.getLabel('animMotion-loopStart') || 'Loop Start' }}</text
			><NumberBox id="animMotion-loopStart" min="0" max="10000"></NumberBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAnimationStore } from '@app/stores/animation';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const animation = useAnimationStore();
const local = useLocalStore();

onMounted(() => {
	animation.syncState();
	local.syncState();
});
</script>
