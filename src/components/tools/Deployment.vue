<template>
	<WindowFrame id="deployment">
		<TitleBar>Deployment<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Platform</div><SelectBox id="deployment-platform" />
				<div class="text">Folder</div><TextBox id="deployment-folder" />
				<div class="text">Output Location</div>
				<div class="flex-box" id="deployment-location-box">
					<TextBox id="deployment-location" />
					<button id="deployment-choose">…</button>
				</div>
				<div class="text">Compress Resources</div>
			<CheckBox id="deployment-compress" standard />
			</div>
			<div class="text" id="deployment-warning" />
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
