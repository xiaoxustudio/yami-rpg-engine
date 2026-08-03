<template>
	<WindowFrame id="deployment">
		<TitleBar>Deployment<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Platform</text><SelectBox id="deployment-platform" />
				<text>Folder</text><TextBox id="deployment-folder" />
				<text>Output Location</text>
				<div class="flex-box" id="deployment-location-box">
					<TextBox id="deployment-location" />
					<button id="deployment-choose">…</button>
				</div>
				<text>Compress Resources</text>
			<CheckBox id="deployment-compress" standard />
			</div>
			<text id="deployment-warning" />
			<button id="deployment-confirm" name="confirm">Confirm</button>
			<button id="deployment-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CheckBox from '@app/components/common/CheckBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
