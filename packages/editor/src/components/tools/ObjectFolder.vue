<template>
		<WindowFrame id="object-folder">
		<template #title><TitleBar>Default Object Folders<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Tilemap</div><TextBox id="object-folder-tilemap" /> <div class="text">Actor</div
				><TextBox id="object-folder-actor" /> <div class="text">Region</div
				><TextBox id="object-folder-region" /> <div class="text">Light</div
				><TextBox id="object-folder-light" /> <div class="text">Animation</div
				><TextBox id="object-folder-animation" /> <div class="text">Particle</div
				><TextBox id="object-folder-particle" /> <div class="text">Parallax</div
				><TextBox id="object-folder-parallax" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextBox from '@app/components/common/TextBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
