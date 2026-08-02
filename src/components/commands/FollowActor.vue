<template>
<WindowFrame id="followActor">
	<TitleBar>Follow Actor<div class="close" /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><CustomBox id="followActor-actor" type="actor" /><text>Target</text><CustomBox id="followActor-target" type="actor" /><text>Mode</text><SelectBox id="followActor-mode" /><text>Min Distance</text
			><NumberVar
				id="followActor-minDist"
				min="0"
				max="16"
				decimals="4"
				unit="tile"
			 /><text>Max Distance</text
			><NumberVar
				id="followActor-maxDist"
				min="0"
				max="20"
				decimals="4"
				unit="tile"
			 /><text>Offset Ratio</text
			><NumberBox
				id="followActor-offset"
				min="-0.8"
				max="0.8"
				decimals="4"
				unit="r"
			 /><text>Vert Distance</text
			><NumberBox
				id="followActor-vertDist"
				min="0"
				max="4"
				decimals="4"
				unit="tile"
			 /><text>Buffer Distance</text
			><NumberBox
				id="followActor-bufferDist"
				min="0"
				max="4"
				decimals="4"
				unit="tile"
			 /><text>Navigate</text><SelectBox id="followActor-navigate" /><text>Bypass Actors</text><SelectBox id="followActor-bypass" /><text>Once</text><SelectBox id="followActor-once" /><text>Wait</text
			><SelectBox id="followActor-wait" name="wait" /></grid-box>
		<button id="followActor-confirm" name="confirm">Confirm</button>
		<button id="followActor-cancel" name="cancel">Cancel</button>
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
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
