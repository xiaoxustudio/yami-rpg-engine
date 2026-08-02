<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileAnimation-sprites') || 'Sprites' }}</DetailSummary>
		<param-list
			id="fileAnimation-sprites"
			class="inspector-list"
			flexible
		/>
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
