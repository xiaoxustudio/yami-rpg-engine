<template>
<WindowFrame id="playAudio">
	<TitleBar>Play Audio<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Type</text><SelectBox id="playAudio-type" /> <text>Audio</text
			><CustomBox id="playAudio-audio" type="file" filter="audio" />
			<text>Volume</text
			><NumberBox id="playAudio-volume" min="0" max="1" step="0.1" decimals="4" />
			<text>Sound Location</text
			><CustomBox id="playAudio-location" type="position" />
		</grid-box>
		<button id="playAudio-confirm" name="confirm">Confirm</button>
		<button id="playAudio-cancel" name="cancel">Cancel</button>
	</content-frame>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
