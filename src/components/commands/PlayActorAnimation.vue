<template>
<WindowFrame id="playActorAnimation">
	<TitleBar>Play Actor Animation<div class="close" /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><CustomBox id="playActorAnimation-actor" type="actor" /><text>Motion</text
			><CustomBox id="playActorAnimation-motion" type="enum-string" /><text>Speed</text
			><NumberVar
				id="playActorAnimation-speed"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
			 /><text>Wait</text><SelectBox id="playActorAnimation-wait" name="wait" /></grid-box>
		<button id="playActorAnimation-confirm" name="confirm">Confirm</button>
		<button id="playActorAnimation-cancel" name="cancel">Cancel</button>
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
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
