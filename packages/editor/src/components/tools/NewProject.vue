<template>
		<WindowFrame id="newProject">
		<template #title><TitleBar>New Project<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Template</div><SelectBox id="newProject-template" />
				<div class="text">Folder</div
				><TextBox
					id="newProject-folder"
					@beforeinput="onFolderBeforeinput"
					@input="onFolderInput"
				/>
				<div class="text">Location</div>
				<div class="flex-box" id="newProject-location-box">
					<TextBox id="newProject-location" @input="onLocationInput" />
					<button id="newProject-choose">…</button>
				</div>
			</div>
			<div class="text" id="newProject-warning" />
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { NewProject } from '@/title/new-project-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onFolderBeforeinput = (event: InputEvent) => {
	NewProject?.folderBeforeinput?.(event);
};
const onFolderInput = () => {
	NewProject?.folderInput?.();
};
const onLocationInput = () => {
	NewProject?.locationInput?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
