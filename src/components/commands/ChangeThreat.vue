<template>
<WindowFrame id="changeThreat">
	<TitleBar>Change Threat<div class="close" /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><CustomBox id="changeThreat-actor" type="actor" /><text>Target</text><CustomBox id="changeThreat-target" type="actor" /><text>Operation</text><SelectBox id="changeThreat-operation" /><text>Threat</text
			><NumberVar
				id="changeThreat-threat"
				min="0"
				max="1000000000"
				decimals="4"
			 /></grid-box>
		<button id="changeThreat-confirm" name="confirm">Confirm</button>
		<button id="changeThreat-cancel" name="cancel">Cancel</button>
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
