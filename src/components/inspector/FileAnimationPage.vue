<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileAnimation-sprites') || 'Sprites' }}</detail-summary>
		<param-list
			id="fileAnimation-sprites"
			class="inspector-list"
			flexible
		/>
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
