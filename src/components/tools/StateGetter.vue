<template>
	<!-- 状态访问器窗口 -->
	<window-frame id="stateGetter">
		<title-bar>Actor<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Type</text><select-box id="stateGetter-type" /> <text>Actor</text
				><custom-box id="stateGetter-actor" type="actor" /> <text>State</text
				><custom-box id="stateGetter-stateId" type="file" filter="state" />
				<text>Variable</text
				><custom-box id="stateGetter-variable" type="variable" filter="object" />
			</grid-box>
			<button id="stateGetter-confirm" name="confirm">Confirm</button>
			<button id="stateGetter-cancel" name="cancel">Cancel</button>
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
