<template>
	<WindowFrame id="about">
		<TitleBar>Yami RPG Editor<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text id="about-credits">Credits</text
				><text>
					<text class="href">刀里个刀</text><br />
					<text class="href" href="https://store.steampowered.com/app/2346410/Border_Pioneer"
						>Yahzj</text
					><br />
					<text class="href" href="https://github.com/chunqian">Chunqian</text><br />
					<text class="href" href="https://github.com/xiaoxustudio">徐然先生</text><br />
					<text class="href">Alias</text><br />
					<text class="href" href="https://www.youtube.com/watch?v=3VcWWYIzKNY"
						>Mr. Von Grimmsy</text
					><br />
					<text class="href" href="https://vk.com/sxdmedia">ZerosmO</text><br />
					<text class="href">SmoLife</text><br />
					<text class="href" href="https://twitter.com/DavisCorsac">Davis Corsac</text><br />
				</text>
				<text>Editor</text><text id="editor-version"></text> <text>Electron</text
				><text id="electron-version"></text> <text>Chromium</text
				><text id="chrome-version"></text> <text>Node.js</text><text id="node-version"></text>
				<text>V8</text><text id="v8-version"></text> <text>OS</text
				><text id="os-version"></text>
			</grid-box>
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
