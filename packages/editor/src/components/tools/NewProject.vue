<template>
		<WindowFrame id="newProject" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.newProject.title') }}<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.newProject-template.label') }}</div><SelectBox id="newProject-template" @input="onTemplateInput" />
				<div class="text">{{ t('components.newProject-folder.label') }}</div
				><TextBox
					id="newProject-folder"
					@beforeinput="onFolderBeforeinput"
					@input="onFolderInput"
				/>
				<div class="text">{{ t('components.newProject-location-box.label') }}</div>
				<div class="flex-box" id="newProject-location-box">
					<TextBox id="newProject-location" @input="onLocationInput" />
					<button id="newProject-choose" @click="onChooseClick">…</button>
				</div>
			</div>
			<div class="text" id="newProject-warning" />
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { NewProject } from '@app/legacy/title/new-project-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

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
const onTemplateInput = () => {
	NewProject?.templateInput?.();
};
const onChooseClick = () => {
	NewProject?.chooseClick?.();
};
const onConfirm = () => {
	NewProject?.confirm?.();
};

onMounted(() => {
});
</script>
