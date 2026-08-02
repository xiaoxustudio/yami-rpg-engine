<template>
	<WindowFrame id="deleteObject">
		<TitleBar>Delete Object<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Object</text><CustomBox id="deleteObject-object" type="object" />
			</grid-box>
			<button id="deleteObject-confirm" name="confirm">Confirm</button>
			<button id="deleteObject-cancel" name="cancel">Cancel</button>
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
