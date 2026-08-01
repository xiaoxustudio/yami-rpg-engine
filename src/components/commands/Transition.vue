<template>
<window-frame id="transition">
	<title-bar>Transition<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Write to Variable</text
			><custom-box id="transition-variable" type="variable" filter="number" />
			<text>Start Value</text
			><number-var
				id="transition-start"
				min="-1000000000"
				max="1000000000"
				decimals="10"
			 />
			<text>End Value</text
			><number-var
				id="transition-end"
				min="-1000000000"
				max="1000000000"
				decimals="10"
			 />
			<text>Easing</text><select-box id="transition-easingId" name="easing" />
			<text>Duration</text
			><number-var
				id="transition-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
			 />
		</grid-box>
		<button id="transition-confirm" name="confirm">Confirm</button>
		<button id="transition-cancel" name="cancel">Cancel</button>
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
