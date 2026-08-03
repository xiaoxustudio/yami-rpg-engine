<template>
<WindowFrame id="moveActor">
	<TitleBar>Move Actor<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="moveActor-actor" type="actor" /><div class="text">Mode</div><SelectBox id="moveActor-mode" /><div class="text">Angle</div
			><NumberVar
				id="moveActor-angle"
				min="-360"
				max="360"
				decimals="4"
				unit="deg"
			 /><div class="text">Destination</div
			><CustomBox id="moveActor-destination" type="position" /><div class="text">Wait</div
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
