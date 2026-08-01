<template>
	<window-frame id="choice">
		<title-bar>Choice<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Content</text
				><text-box
					id="choice-content"
					menu="tag-local-var tag-global-var tag-localization"
				/>
			</grid-box>
			<button id="choice-confirm" name="confirm">Confirm</button>
			<button id="choice-cancel" name="cancel">Cancel</button>
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
