<template>
<WindowFrame id="getActor">
	<TitleBar>Get Actor<div class="close" /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Write to Variable</text
			><CustomBox id="getActor-variable" type="variable" filter="object" /><text>Position</text><CustomBox id="getActor-position" type="position" /><text>Area</text><SelectBox id="getActor-area" /><text>Size</text
			><NumberVar id="getActor-size" min="0" max="512" decimals="4" unit="tile" /><text>Radius</text
			><NumberVar
				id="getActor-radius"
				min="0"
				max="256"
				decimals="4"
				unit="tile"
			 /><text>Selector</text><SelectBox id="getActor-selector" /><text>Team</text
			><SelectVar id="getActor-teamId" /><text>Condition</text
			><SelectBox id="getActor-condition" /><text>Attribute</text
			><SelectBox id="getActor-attribute" /><text>Attribute 2</text
			><SelectBox id="getActor-divisor" /><text>Activation</text
			><SelectBox id="getActor-activation" /><text>Exclusion</text
			><SelectBox id="getActor-exclusion" /><text>Exclusion Actor</text
			><CustomBox id="getActor-exclusionActor" type="actor" /><text>Exclusion Team</text><SelectVar id="getActor-exclusionTeamId" /></grid-box>
		<button id="getActor-confirm" name="confirm">Confirm</button>
		<button id="getActor-cancel" name="cancel">Cancel</button>
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
