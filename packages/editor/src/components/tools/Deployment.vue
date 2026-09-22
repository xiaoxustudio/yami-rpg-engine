<template>
	<WindowFrame id="deployment" :confirm-disabled="confirmDisabled" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.deployment.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.deployment-platform.label') }}</div>
			<SelectBox
				id="deployment-platform"
				v-tip="t('components.deployment-platform.tip')"
				:ref="registryRef(titleEls, 'deployment-platform')"
				v-focus
				v-model="Deployment.form.platform"
				@input="onPlatformInput"
			/>
			<div class="text">{{ t('components.deployment-folder.label') }}</div>
			<TextBox
				id="deployment-folder"
				v-tip="t('components.deployment-folder.tip')"
				v-model="Deployment.form.folder"
				@beforeinput="onFolderBeforeinput"
				@input="onFolderInput"
			/>
			<div class="text">{{ t('components.deployment-location-box.label') }}</div>
			<div class="flex-box" id="deployment-location-box">
				<TextBox
					id="deployment-location"
					v-tip="t('components.deployment-location.tip')"
					v-model="Deployment.form.location"
					@input="onLocationInput"
				/>
				<button
					id="deployment-choose"
					v-tip="t('components.deployment-choose.tip')"
					@click="onChooseClick"
				>
					…
				</button>
			</div>
			<div class="text">{{ t('components.deployment-compress.label') }}</div>
			<CheckBox
				id="deployment-compress"
				v-tip="t('components.deployment-compress.tip')"
				standard
				@change="onCompressChange"
			/>
		</div>
		<div
			class="text"
			id="deployment-warning"
			:ref="registryRef(titleEls, 'deployment-warning')"
		/>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { titleEls } from '@app/title/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import {
	Deployment,
	deploymentConfirmDisabled as confirmDisabled
} from '@app/title/deploy-project-window';
import { useToastService } from '@app/composables/useToastService';

const { t } = useI18n();

const toast = useToastService();

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
	toast.show('Deployment started', 'info');
};

onMounted(() => {});
</script>

<style>
/* 窗口样式迁移：由 Project/css/ui.css 迁入组件（选择器为全局 id，不能用 scoped） */
#deployment {
	width: 448px;
	height: 166px;
}

#deployment-folder {
	width: 324px;
}

#deployment-location {
	width: 300px;
}

#deployment-compress {
	width: 300px;
}

#deployment-choose {
	position: static;
	width: 20px;
}

#deployment-warning {
	position: absolute;
	left: 10px;
	bottom: 10px;
	line-height: 20px;
	white-space: nowrap;
	background-color: var(--selected-background);
}

#deployment-confirm {
	right: 108px;
	bottom: 10px;
}

#deployment-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
