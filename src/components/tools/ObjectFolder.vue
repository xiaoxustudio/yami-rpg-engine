<template>
		<WindowFrame id="object-folder">
		<TitleBar>Default Object Folders<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text>Tilemap</text><TextBox id="object-folder-tilemap" /> <text>Actor</text
				><TextBox id="object-folder-actor" /> <text>Region</text
				><TextBox id="object-folder-region" /> <text>Light</text
				><TextBox id="object-folder-light" /> <text>Animation</text
				><TextBox id="object-folder-animation" /> <text>Particle</text
				><TextBox id="object-folder-particle" /> <text>Parallax</text
				><TextBox id="object-folder-parallax" />
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
import TextBox from '@app/components/common/TextBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
