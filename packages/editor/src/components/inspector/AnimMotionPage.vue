<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('animMotion-general-grid') || 'Motion' }}</DetailSummary>
		<div class="detail-grid" id="animMotion-general-grid">
			<div class="text">{{ local.getLabel('animMotion-mode') || 'Direction' }}</div><SelectBox id="animMotion-mode" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('animMotion-skip') || 'Skip Last Frame' }}</div
			><CheckBox id="animMotion-skip" class="standard large" @input="onParamInput"></CheckBox>
			<div class="text">{{ local.getLabel('animMotion-loop') || 'Loop' }}</div
			><CheckBox id="animMotion-loop" class="standard large" @input="onParamInput"></CheckBox>
			<div class="text">{{ local.getLabel('animMotion-loopStart') || 'Loop Start' }}</div
			><NumberBox id="animMotion-loopStart" min="0" max="10000" @input="onParamInput"></NumberBox>
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
import CheckBox from '@app/components/common/CheckBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const animation = useAnimationStore();
const local = useLocalStore();

const onParamInput = (event: Event) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.animMotion?.paramInput?.({ target });
};

onMounted(() => {
	animation.syncState();
	local.syncState();
});
</script>
