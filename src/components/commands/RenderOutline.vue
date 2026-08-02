<template>
<WindowFrame id="renderOutline">
	<TitleBar>Render Outline<div class="close" /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Operation</text><SelectBox id="renderOutline-operation" /><text>Actor</text><CustomBox id="renderOutline-actor" type="actor" /><text>Color</text><ColorBox id="renderOutline-color" /></grid-box>
		<button id="renderOutline-confirm" name="confirm">Confirm</button>
		<button id="renderOutline-cancel" name="cancel">Cancel</button>
	</content-frame>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from "@app/stores/inspector";
import { useLocalStore } from "@app/stores/local";
import ColorBox from '@app/components/common/ColorBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
