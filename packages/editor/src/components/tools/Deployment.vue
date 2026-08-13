<template>
	<WindowFrame id="deployment" @confirm="onConfirm">
		<template #title><TitleBar>Deployment<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Platform</div><SelectBox id="deployment-platform" @input="onPlatformInput" />
				<div class="text">Folder</div
				><TextBox
					id="deployment-folder"
					@beforeinput="onFolderBeforeinput"
					@input="onFolderInput"
				/>
				<div class="text">Output Location</div>
				<div class="flex-box" id="deployment-location-box">
					<TextBox id="deployment-location" @input="onLocationInput" />
					<button id="deployment-choose" @click="onChooseClick">…</button>
				</div>
				<div class="text">Compress Resources</div>
			<CheckBox id="deployment-compress" standard @change="onCompressChange" />
			</div>
			<div class="text" id="deployment-warning" />
		
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
import { Deployment } from '@/title/deploy-project-window';

const inspector = useInspectorStore();
const local = useLocalStore();

const onFolderBeforeinput = (event: InputEvent) => {
	Deployment?.folderBeforeinput?.(event);
};
const onFolderInput = () => {
	Deployment?.folderInput?.();
};
const onLocationInput = () => {
	Deployment?.locationInput?.();
};
const onPlatformInput = () => {
	Deployment?.platformInput?.();
};
const onChooseClick = () => {
	Deployment?.chooseClick?.();
};
const onCompressChange = (value: boolean) => {
	Deployment.compress = value;
};
const onConfirm = () => {
	Deployment?.confirm?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
