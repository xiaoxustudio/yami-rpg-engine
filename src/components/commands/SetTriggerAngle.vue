<template>
	<WindowFrame id="setTriggerAngle">
		<TitleBar>Set Trigger Angle<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Trigger</div
				><CustomBox id="setTriggerAngle-trigger" type="trigger" /> <div class="text">Angle</div
				><CustomBox id="setTriggerAngle-angle" type="angle" />
			</div>
			<button id="setTriggerAngle-confirm" name="confirm">Confirm</button>
			<button id="setTriggerAngle-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
	
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
