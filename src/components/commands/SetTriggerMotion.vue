<template>
	<WindowFrame id="setTriggerMotion">
		<TitleBar>Set Trigger Motion<div class="close" /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Trigger</text
				><CustomBox id="setTriggerMotion-trigger" type="trigger" />
				<text>Motion</text
				><CustomBox id="setTriggerMotion-motion" type="enum-string" />
			</grid-box>
			<button id="setTriggerMotion-confirm" name="confirm">Confirm</button>
			<button id="setTriggerMotion-cancel" name="cancel">Cancel</button>
		</content-frame>
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
