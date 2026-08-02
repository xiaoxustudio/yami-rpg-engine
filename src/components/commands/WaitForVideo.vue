<template>
	<WindowFrame id="waitForVideo">
		<TitleBar>Wait For Video<div class="close" /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Element</text><CustomBox id="waitForVideo-element" type="element" />
			</grid-box>
			<button id="waitForVideo-confirm" name="confirm">Confirm</button>
			<button id="waitForVideo-cancel" name="cancel">Cancel</button>
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
