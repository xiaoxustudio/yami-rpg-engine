<template>
	<WindowFrame id="project-settings" ref="frame" buttons-id-prefix="project" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.project-settings.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="box" id="project-page">
			<div class="box" id="project-grid-box">
				<ProjectSettingsDisplaySection />
				<ProjectSettingsSceneSection />
				<ProjectSettingsTextSection />
				<ProjectSettingsEngineSection />
				<ProjectSettingsOtherSection />
			</div>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProjectSettingsWindow } from '@app/composables/useProjectSettingsWindow';
import {
	getProjectSettingsFrame,
	setProjectSettingsFrame
} from '@app/composables/project-settings-controls';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import ProjectSettingsDisplaySection from './project-settings/ProjectSettingsDisplaySection.vue';
import ProjectSettingsSceneSection from './project-settings/ProjectSettingsSceneSection.vue';
import ProjectSettingsTextSection from './project-settings/ProjectSettingsTextSection.vue';
import ProjectSettingsEngineSection from './project-settings/ProjectSettingsEngineSection.vue';
import ProjectSettingsOtherSection from './project-settings/ProjectSettingsOtherSection.vue';

const { t } = useI18n();

const settings = useProjectSettingsWindow();

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	settings.confirm();
};

onMounted(() => {
	// 单例要往帧上挂 close / closed / change 监听；各 section 自己交出控件
	const el = frame.value?.root ?? null;
	setProjectSettingsFrame(el);
	onUnmounted(() => {
		if (getProjectSettingsFrame() === el) setProjectSettingsFrame(null);
	});
});
</script>

<style>
#project-settings {
	width: 480px;
	height: 700px;
}

#project-page {
	position: absolute;
	top: 0;
	bottom: 40px;
	width: 100%;
	overflow-x: hidden;
	overflow-y: scroll;
}

#project-grid-box {
	display: grid;
	margin: 10px 4px 10px 10px;
	grid-gap: 4px;
	grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
	line-height: 20px;
	white-space: nowrap;
}
</style>
