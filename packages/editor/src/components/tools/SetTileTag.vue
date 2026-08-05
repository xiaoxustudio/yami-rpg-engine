<template>
	<WindowFrame id="setTileTag">
		<template #title><TitleBar>Set Tile Tag<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Tag</div><NumberBox id="setTileTag-tag" min="0" max="99999" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberBox from '@app/components/common/NumberBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
