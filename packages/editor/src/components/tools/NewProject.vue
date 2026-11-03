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
				:label="t('components.newProject-template.label')"
				id="newProject-template"
				v-tip="t('components.newProject-template.tip')"
				:ref="controlRef('newProject-template')"
				v-focus
				v-model="form.template"
				@input="onTemplateInput"
			/>
			<div class="text">{{ t('components.newProject-folder.label') }}</div>
			<TextBox
				:label="t('components.newProject-folder.label')"
				id="newProject-folder"
				v-tip="t('components.newProject-folder.tip')"
				v-model="form.folder"
				@beforeinput="onFolderBeforeinput"
				@input="onFolderInput"
			/>
			<div class="text">{{ t('components.newProject-location-box.label') }}</div>
			<div class="flex-box" id="newProject-location-box">
				<TextBox
					:label="t('components.newProject-location-box.label')"
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
		<div class="text" id="newProject-warning">{{ warning }}</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	NewProject,
	newProjectConfirmDisabled as confirmDisabled
} from '@app/title/new-project-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';
import {
	provideNewProjectBridge,
	resetNewProjectBridge,
	type NewProjectBridge
} from '@app/composables/new-project-bridge';

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

/** 控件表：模板下拉要自己灌候选项、并在建工程时被单例读取。 */
type Id = 'newProject-template';

const { controls, controlRef } = useControlRefs<Id>();

/** 校验提示由窗口自己渲染，单例经桥写文案。 */
const warning = ref('');

const bridgeApi: NewProjectBridge = {
	setWarning: (text) => {
		warning.value = text;
	},
	getTemplate: () => (controls['newProject-template']?.read?.() as string) ?? null
};

onMounted(() => {
	provideNewProjectBridge(bridgeApi);
	onUnmounted(() => resetNewProjectBridge(bridgeApi));
	controls['newProject-template']?.loadItems?.([
		{ name: 'ARPG - English', value: 'arpg-ts-english' },
		{ name: 'ARPG - 简体中文', value: 'arpg-ts-chinese' },
		{ name: 'Minimized Current Project', value: 'minimized-project' }
	]);
});
</script>

<style>
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
