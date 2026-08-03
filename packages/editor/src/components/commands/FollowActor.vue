<template>
<WindowFrame id="followActor">
	<TitleBar>Follow Actor<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="followActor-actor" type="actor" /><div class="text">Target</div><CustomBox id="followActor-target" type="actor" /><div class="text">Mode</div><SelectBox id="followActor-mode" /><div class="text">Min Distance</div
			><NumberVar
				id="followActor-minDist"
				min="0"
				max="16"
				decimals="4"
				unit="tile"
			 /><div class="text">Max Distance</div
			><NumberVar
				id="followActor-maxDist"
				min="0"
				max="20"
				decimals="4"
				unit="tile"
			 /><div class="text">Offset Ratio</div
			><NumberBox
				id="followActor-offset"
				min="-0.8"
				max="0.8"
				decimals="4"
				unit="r"
			 /><div class="text">Vert Distance</div
			><NumberBox
				id="followActor-vertDist"
				min="0"
				max="4"
				decimals="4"
				unit="tile"
			 /><div class="text">Buffer Distance</div
			><NumberBox
				id="followActor-bufferDist"
				min="0"
				max="4"
				decimals="4"
				unit="tile"
			 /><div class="text">Navigate</div><SelectBox id="followActor-navigate" /><div class="text">Bypass Actors</div><SelectBox id="followActor-bypass" /><div class="text">Once</div><SelectBox id="followActor-once" /><div class="text">Wait</div
			><SelectBox id="followActor-wait" name="wait" /></div>
		<button id="followActor-confirm" name="confirm">Confirm</button>
		<button id="followActor-cancel" name="cancel">Cancel</button>
	</div>
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
