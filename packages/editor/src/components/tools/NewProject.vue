<template>
	<WindowFrame id="newProject" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.newProject.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.newProject-template.label') }}</div>
			<SelectBox
				id="newProject-template"
				v-focus
				v-model="form.template"
				@input="onTemplateInput"
			/>
			<div class="text">{{ t('components.newProject-folder.label') }}</div>
			<TextBox
				id="newProject-folder"
				v-model="form.folder"
				@beforeinput="onFolderBeforeinput"
				@input="onFolderInput"
			/>
			<div class="text">{{ t('components.newProject-location-box.label') }}</div>
			<div class="flex-box" id="newProject-location-box">
				<TextBox
					id="newProject-location"
					v-model="form.location"
					@input="onLocationInput"
				/>
				<button id="newProject-choose" @click="onChooseClick">…</button>
			</div>
		</div>
		<div class="text" id="newProject-warning" />
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { NewProject } from '@app/title/new-project-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form } = NewProject;

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

onMounted(() => {});
</script>

<style>
/* 窗口样式迁移：由 Project/css/ui.css 迁入组件（选择器为全局 id，不能用 scoped） */
#newProject {
	width: 448px;
	height: 146px;
}

#newProject-folder {
	width: 324px;
}

#newProject-location {
	width: 300px;
}

#newProject-choose {
	position: static;
	width: 20px;
}

#newProject-warning {
	position: absolute;
	left: 10px;
	bottom: 10px;
	line-height: 20px;
	white-space: nowrap;
	background-color: var(--selected-background);
}

#newProject-confirm {
	right: 108px;
	bottom: 10px;
}

#newProject-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

