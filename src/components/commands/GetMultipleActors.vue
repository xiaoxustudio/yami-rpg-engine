<template>
<WindowFrame id="getMultipleActors">
	<TitleBar>Get Actor<div class="close" /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Write to List</text
			><CustomBox
				id="getMultipleActors-variable"
				type="variable"
				filter="object"
			 /><text>Position</text
			><CustomBox id="getMultipleActors-position" type="position" /><text>Area</text><SelectBox id="getMultipleActors-area" /><text>Width</text
			><NumberVar
				id="getMultipleActors-width"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			 /><text>Height</text
			><NumberVar
				id="getMultipleActors-height"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			 /><text>Radius</text
			><NumberVar
				id="getMultipleActors-radius"
				min="0"
				max="256"
				decimals="4"
				unit="tile"
			 /><text>Selector</text><SelectBox id="getMultipleActors-selector" /><text>Team</text><SelectVar id="getMultipleActors-teamId" /><text>Activation</text><SelectBox id="getMultipleActors-activation" /></grid-box>
		<button id="getMultipleActors-confirm" name="confirm">Confirm</button>
		<button id="getMultipleActors-cancel" name="cancel">Cancel</button>
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
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
