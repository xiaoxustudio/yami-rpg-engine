<template>
	<WindowFrame id="setTriggerMotion">
		<TitleBar>Set Trigger Motion<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Trigger</div
				><CustomBox id="setTriggerMotion-trigger" type="trigger" />
				<div class="text">Motion</div
				><CustomBox id="setTriggerMotion-motion" type="enum-string" />
			</div>
			<button id="setTriggerMotion-confirm" name="confirm">Confirm</button>
			<button id="setTriggerMotion-cancel" name="cancel">Cancel</button>
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
