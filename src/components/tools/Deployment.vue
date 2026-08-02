<template>
	<WindowFrame id="deployment">
		<TitleBar>Deployment<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Platform</text><select-box id="deployment-platform" />
				<text>Folder</text><text-box id="deployment-folder" />
				<text>Output Location</text>
				<flex-box id="deployment-location-box">
					<text-box id="deployment-location" />
					<button id="deployment-choose">…</button>
				</flex-box>
				<text>Compress Resources</text>
			<CheckBox id="deployment-compress" standard />
			</grid-box>
			<text id="deployment-warning" />
			<button id="deployment-confirm" name="confirm">Confirm</button>
			<button id="deployment-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CheckBox from '@app/components/common/CheckBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
