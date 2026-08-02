<template>
		<WindowFrame id="object-folder">
		<TitleBar>Default Object Folders<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text>Tilemap</text><text-box id="object-folder-tilemap" /> <text>Actor</text
				><text-box id="object-folder-actor" /> <text>Region</text
				><text-box id="object-folder-region" /> <text>Light</text
				><text-box id="object-folder-light" /> <text>Animation</text
				><text-box id="object-folder-animation" /> <text>Particle</text
				><text-box id="object-folder-particle" /> <text>Parallax</text
				><text-box id="object-folder-parallax" />
			</grid-box>
			<button id="object-folder-confirm" name="confirm">Confirm</button>
			<button id="object-folder-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
