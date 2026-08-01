<template>
<window-frame id="setPan">
	<title-bar>Set Pan<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Type</text><select-box id="setPan-type" /> <text>Pan</text
			><number-var id="setPan-pan" min="-1" max="1" step="0.1" decimals="4" />
			<text>Easing</text><select-box id="setPan-easingId" name="easing" />
			<text>Duration</text
			><number-box
				id="setPan-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
			 />
			<text>Wait</text><select-box id="setPan-wait" name="wait" />
		</grid-box>
		<button id="setPan-confirm" name="confirm">Confirm</button>
		<button id="setPan-cancel" name="cancel">Cancel</button>
	</content-frame>
</window-frame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
