<template>
	<window-frame id="insertImage">
		<title-bar>Insert Image<close></close></title-bar>
		<content-frame>
			<grid-box>
				<text>Mode</text><select-box id="insertImage-mode" /> <text>Image</text
				><custom-box id="insertImage-image" type="file" filter="image" />
				<text>Clip</text
				><custom-box id="insertImage-clip" type="clip" image="insertImage-image" />
				<text>Width</text><number-box id="insertImage-width" min="0" max="10000" />
				<text>Height</text><number-box id="insertImage-height" min="0" max="10000" />
			</grid-box>
			<button id="insertImage-confirm" name="confirm">Confirm</button>
			<button id="insertImage-cancel" name="cancel">Cancel</button>
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
