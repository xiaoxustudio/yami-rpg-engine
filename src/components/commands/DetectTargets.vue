<template>
<WindowFrame id="detectTargets">
	<TitleBar>Detect Targets<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><CustomBox id="detectTargets-actor" type="actor" /><text>Distance</text
			><NumberVar
				id="detectTargets-distance"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			 /><text>Selector</text><SelectBox id="detectTargets-selector" /><text>In Sight</text><SelectBox id="detectTargets-inSight" /></grid-box>
		<button id="detectTargets-confirm" name="confirm">Confirm</button>
		<button id="detectTargets-cancel" name="cancel">Cancel</button>
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
