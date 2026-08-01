<template>
	<window-frame id="clampCamera">
		<title-bar>Clamp Camera<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Left</text
				><number-var
					id="clampCamera-left"
					min="-1000"
					max="1000"
					step="0.1"
					decimals="4"
				 />
				<text>Top</text
				><number-var
					id="clampCamera-top"
					min="-1000"
					max="1000"
					step="0.1"
					decimals="4"
				 />
				<text>Right</text
				><number-var
					id="clampCamera-right"
					min="-1000"
					max="1000"
					step="0.1"
					decimals="4"
				 />
				<text>Bottom</text
				><number-var
					id="clampCamera-bottom"
					min="-1000"
					max="1000"
					step="0.1"
					decimals="4"
				 />
			</grid-box>
			<button id="clampCamera-confirm" name="confirm">Confirm</button>
			<button id="clampCamera-cancel" name="cancel">Cancel</button>
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
