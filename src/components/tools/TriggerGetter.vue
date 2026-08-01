<template>
	<!-- 触发器访问器窗口 -->
	<window-frame id="triggerGetter">
		<title-bar>Trigger<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Type</text><select-box id="triggerGetter-type" /> <text>Variable</text
				><custom-box id="triggerGetter-variable" type="variable" filter="object" />
			</grid-box>
			<button id="triggerGetter-confirm" name="confirm">Confirm</button>
			<button id="triggerGetter-cancel" name="cancel">Cancel</button>
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
