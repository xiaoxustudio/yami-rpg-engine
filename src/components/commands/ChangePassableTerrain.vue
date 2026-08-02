<template>
<WindowFrame id="changePassableTerrain">
	<TitleBar>Change Passable Terrain<div class="close" /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text
			><CustomBox id="changePassableTerrain-actor" type="actor" /><text>Passable Terrain</text
			><SelectBox id="changePassableTerrain-passage" /></grid-box>
		<button id="changePassableTerrain-confirm" name="confirm">Confirm</button>
		<button id="changePassableTerrain-cancel" name="cancel">Cancel</button>
	</content-frame>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from "@app/stores/inspector";
import { useLocalStore } from "@app/stores/local";
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
