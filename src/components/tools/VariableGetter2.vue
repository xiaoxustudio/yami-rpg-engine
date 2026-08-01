<template>
	<!-- 变量访问器窗口2 -->
	<window-frame id="variableGetter2">
		<title-bar>Variable<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Type</text><select-box id="variableGetter2-type" /> <text>Element</text
				><custom-box id="variableGetter2-element" type="element" /> <text>Key</text
				><text-box id="variableGetter2-common-key" /> <text>Key</text
				><select-box id="variableGetter2-preset-key" /> <text>Key</text
				><custom-box id="variableGetter2-global-key" type="global-variable" />
			</grid-box>
			<button id="variableGetter2-confirm" name="confirm">Confirm</button>
			<button id="variableGetter2-cancel" name="cancel">Cancel</button>
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
