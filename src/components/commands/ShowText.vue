<template>
<window-frame id="showText">
	<title-bar>Show Text<close /></title-bar>
	<content-frame>
		<custom-box id="showText-target" type="actor" />
		<text-box id="showText-parameters" />
		<text-area
			id="showText-content"
			menu="tag-local-var tag-global-var tag-localization"
		 />
		<button id="showText-confirm" name="confirm">Confirm</button>
		<button id="showText-cancel" name="cancel">Cancel</button>
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
