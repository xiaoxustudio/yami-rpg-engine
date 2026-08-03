<template>
<WindowFrame id="setAngle">
	<TitleBar>Set Angle<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="setAngle-actor" type="actor" /><div class="text">Angle</div><CustomBox id="setAngle-angle" type="angle" /><div class="text">Easing</div><SelectBox id="setAngle-easingId" name="easing" /><div class="text">Duration</div
			><NumberVar
				id="setAngle-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
			 /><div class="text">Wait</div><SelectBox id="setAngle-wait" name="wait" /></div>
		<button id="setAngle-confirm" name="confirm">Confirm</button>
		<button id="setAngle-cancel" name="cancel">Cancel</button>
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
