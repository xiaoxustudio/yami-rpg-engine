<template>
	<window-frame id="setNumber">
		<title-bar>Set Number<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Variable</text
				><custom-box
					id="setNumber-variable"
					type="variable"
					filter="writable-number"
				/>
				<text>Expression</text><param-list id="setNumber-operands" />
			</grid-box>
			<button id="setNumber-confirm" name="confirm">Confirm</button>
			<button id="setNumber-cancel" name="cancel">Cancel</button>
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
