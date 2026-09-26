<template>
	<WindowFrame id="newProject" :confirm-disabled="confirmDisabled" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.newProject.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.newProject-template.label') }}</div>
			<SelectBox
				id="newProject-template"
				v-tip="t('components.newProject-template.tip')"
				:ref="registryRef(titleEls, 'newProject-template')"
				v-focus
				v-model="form.template"
				@input="onTemplateInput"
			/>
			<div class="text">{{ t('components.newProject-folder.label') }}</div>
			<TextBox
				id="newProject-folder"
				v-tip="t('components.newProject-folder.tip')"
				v-model="form.folder"
				@beforeinput="onFolderBeforeinput"
				@input="onFolderInput"
			/>
			<div class="text">{{ t('components.newProject-location-box.label') }}</div>
			<div class="flex-box" id="newProject-location-box">
				<TextBox
					id="newProject-location"
					v-tip="t('components.newProject-location.tip')"
					v-model="form.location"
					@input="onLocationInput"
				/>
				<button
					id="newProject-choose"
					v-tip="t('components.newProject-choose.tip')"
					@click="onChooseClick"
				>
					…
				</button>
			</div>
		</div>
		<div
			class="text"
			id="newProject-warning"
			:ref="registryRef(titleEls, 'newProject-warning')"
		/>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { titleEls } from '@app/title/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import {
	NewProject,
	newProjectConfirmDisabled as confirmDisabled
} from '@app/title/new-project-window.ts';
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
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
