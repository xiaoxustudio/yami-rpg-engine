<template>
		<WindowFrame id="rename">
		<TitleBar>Rename<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="grid-box"> <text>Name</text><TextBox id="rename-name" /> </div>
			<button id="rename-confirm" name="confirm">Confirm</button>
			<button id="rename-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextBox from '@app/components/common/TextBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
