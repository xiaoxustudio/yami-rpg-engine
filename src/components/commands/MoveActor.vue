<template>
<WindowFrame id="moveActor">
	<TitleBar>Move Actor<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<text>Actor</text><CustomBox id="moveActor-actor" type="actor" /><text>Mode</text><SelectBox id="moveActor-mode" /><text>Angle</text
			><NumberVar
				id="moveActor-angle"
				min="-360"
				max="360"
				decimals="4"
				unit="deg"
			 /><text>Destination</text
			><CustomBox id="moveActor-destination" type="position" /><text>Wait</text
			><SelectBox id="moveActor-wait" name="wait" /></div>
		<button id="moveActor-confirm" name="confirm">Confirm</button>
		<button id="moveActor-cancel" name="cancel">Cancel</button>
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
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
