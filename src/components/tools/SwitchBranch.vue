<template>
	<!-- 匹配 - 分支 -->
	<window-frame id="switch-branch">
		<title-bar>Branch<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Cases</text><param-list id="switch-branch-conditions" />
			</grid-box>
			<button id="switch-branch-confirm" name="confirm">Confirm</button>
			<button id="switch-branch-cancel" name="cancel">Cancel</button>
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
