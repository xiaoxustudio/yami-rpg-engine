<template>
	<WindowFrame id="setNumber">
		<TitleBar>Set Number<close /></TitleBar>
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
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
