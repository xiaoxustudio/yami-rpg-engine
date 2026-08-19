<template>
		<WindowFrame id="project-settings" buttons-id-prefix="project">
		<template #title><TitleBar>{{ t('components.project-settings.title') }}<div class="close"></div></TitleBar></template>
		
			<div class="box" id="project-page">
				<div class="box" id="project-grid-box">
					<div class="text project-summary" id="config-window-summary">{{ t('components.config-window-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-window-title.label') }}</div
					><TextBox id="config-window-title" />
					<div class="text project-label">{{ t('components.config-window-width.label') }}</div
					><NumberBox id="config-window-width" min="240" max="7680" unit="px" />
					<div class="text project-label">{{ t('components.config-window-height.label') }}</div
					><NumberBox id="config-window-height" min="240" max="7680" unit="px" />
					<div class="text project-label">{{ t('components.config-window-display.label') }}</div
					><SelectBox id="config-window-display" />
					<div class="text project-summary" id="config-resolution-summary"
						>{{ t('components.config-resolution-summary.content') }}</div
					>
					<div class="text project-label">{{ t('components.config-resolution-width.label') }}</div
					><NumberBox
						id="config-resolution-width"
						min="240"
						max="7680"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-resolution-height.label') }}</div
					><NumberBox
						id="config-resolution-height"
						min="240"
						max="7680"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-resolution-sceneScale.label') }}</div
					><NumberBox
						id="config-resolution-sceneScale"
						min="0.5"
						max="8"
						decimals="10"
					/>
					<div class="text project-label">{{ t('components.config-resolution-uiScale.label') }}</div
					><NumberBox
						id="config-resolution-uiScale"
						min="0.5"
						max="4"
						decimals="10"
					/>
					<div class="text project-summary" id="config-scene-summary">{{ t('components.config-scene-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-scene-padding.label') }}</div
					><NumberBox id="config-scene-padding" min="0" max="7680" unit="px" />
					<div class="text project-label">{{ t('components.config-scene-animationInterval.label') }}</div
					><NumberBox
						id="config-scene-animationInterval"
						min="0"
						max="1000"
						unit="ms"
					/>
					<div class="text project-summary" id="config-tileArea-summary"
						>{{ t('components.config-tileArea-summary.content') }}</div
					>
					<div class="text project-label">{{ t('components.config-tileArea-expansionTop.label') }}</div
					><NumberBox
						id="config-tileArea-expansionTop"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-tileArea-expansionLeft.label') }}</div
					><NumberBox
						id="config-tileArea-expansionLeft"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-tileArea-expansionRight.label') }}</div
					><NumberBox
						id="config-tileArea-expansionRight"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-tileArea-expansionBottom.label') }}</div
					><NumberBox
						id="config-tileArea-expansionBottom"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-summary" id="config-animationArea-summary"
						>{{ t('components.config-animationArea-summary.content') }}</div
					>
					<div class="text project-label">{{ t('components.config-animationArea-expansionTop.label') }}</div
					><NumberBox
						id="config-animationArea-expansionTop"
						min="0"
						max="800"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-animationArea-expansionLeft.label') }}</div
					><NumberBox
						id="config-animationArea-expansionLeft"
						min="0"
						max="800"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-animationArea-expansionRight.label') }}</div
					><NumberBox
						id="config-animationArea-expansionRight"
						min="0"
						max="800"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-animationArea-expansionBottom.label') }}</div
					><NumberBox
						id="config-animationArea-expansionBottom"
						min="0"
						max="800"
						unit="px"
					/>
					<div class="text project-summary" id="config-lightArea-summary"
						>{{ t('components.config-lightArea-summary.content') }}</div
					>
					<div class="text project-label">{{ t('components.config-lightArea-expansionTop.label') }}</div
					><NumberBox
						id="config-lightArea-expansionTop"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-lightArea-expansionLeft.label') }}</div
					><NumberBox
						id="config-lightArea-expansionLeft"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-lightArea-expansionRight.label') }}</div
					><NumberBox
						id="config-lightArea-expansionRight"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-lightArea-expansionBottom.label') }}</div
					><NumberBox
						id="config-lightArea-expansionBottom"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-summary" id="config-virtualAxis-summary">{{ t('components.config-virtualAxis-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-virtualAxis-up.label') }}</div
					><KeyboardBox id="config-virtualAxis-up" />
					<div class="text project-label">{{ t('components.config-virtualAxis-down.label') }}</div
					><KeyboardBox id="config-virtualAxis-down" />
					<div class="text project-label">{{ t('components.config-virtualAxis-left.label') }}</div
					><KeyboardBox id="config-virtualAxis-left" />
					<div class="text project-label">{{ t('components.config-virtualAxis-right.label') }}</div
					><KeyboardBox id="config-virtualAxis-right" />
					<div class="text project-summary" id="config-collision-summary">{{ t('components.config-collision-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-collision-actor-enabled.label') }}</div
					><SelectBox id="config-collision-actor-enabled" />
					<div class="text project-label">{{ t('components.config-collision-scene-enabled.label') }}</div
					><SelectBox id="config-collision-scene-enabled" />
					<div class="text project-label">{{ t('components.config-collision-scene-actorSize.label') }}</div
					><NumberBox
						id="config-collision-scene-actorSize"
						min="0.5"
						max="1"
						step="0.1"
						decimals="4"
						unit="tile"
					/>
					<div class="text project-label">{{ t('components.config-collision-trigger-collideWithActorShape.label') }}</div
					><SelectBox id="config-collision-trigger-collideWithActorShape" />
					<div class="text project-summary" id="config-text-summary">{{ t('components.config-text-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-text-importedFonts.label') }}</div
					><ParamList id="config-text-importedFonts" flexible />
					<div class="text project-label">{{ t('components.config-text-fontFamily.label') }}</div
					><TextBox id="config-text-fontFamily" />
					<div class="text project-label">{{ t('components.config-text-highDefinition.label') }}</div
					><SelectBox id="config-text-highDefinition" />
					<div class="text project-summary" id="config-actor-summary">{{ t('components.config-actor-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-actor-tempAttributes.label') }}</div
					><ParamList id="config-actor-tempAttributes" group="actor" flexible />
					<div class="text project-summary" id="config-animation-summary">{{ t('components.config-animation-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-animation-frameRate.label') }}</div
					><NumberBox
						id="config-animation-frameRate"
						min="1"
						max="240"
						unit="fps"
					/>
					<div class="text project-summary" id="config-soundAttenuation-summary"
						>{{ t('components.config-soundAttenuation-summary.content') }}</div
					>
					<div class="text project-label">{{ t('components.config-soundAttenuation-distance.label') }}</div
					><NumberBox
						id="config-soundAttenuation-distance"
						min="0"
						max="100"
						unit="tile"
					/>
					<div class="text project-label">{{ t('components.config-soundAttenuation-easingId.label') }}</div
					><SelectBox id="config-soundAttenuation-easingId" />
					<div class="text project-summary" id="config-webgl-summary">{{ t('components.config-webgl-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-webgl-desynchronized.label') }}</div
					><SelectBox id="config-webgl-desynchronized" />
					<div class="text project-label">{{ t('components.config-webgl-textureMagFilter.label') }}</div
					><SelectBox id="config-webgl-textureMagFilter" />
					<div class="text project-label">{{ t('components.config-webgl-textureMinFilter.label') }}</div
					><SelectBox id="config-webgl-textureMinFilter" />
					<div class="text project-summary" id="config-script-summary">{{ t('components.config-script-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-script-autoCompile.label') }}</div
					><SelectBox id="config-script-autoCompile" />
					<div class="text project-summary" id="config-save-summary">{{ t('components.config-save-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-save-location.label') }}</div
					><SelectBox id="config-save-location" />
					<div class="text project-label">{{ t('components.config-save-subdir.label') }}</div
					><TextBox id="config-save-subdir" />
					<div class="text project-summary" id="config-localization-summary">{{ t('components.config-localization-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-localization-languages.label') }}</div
					><ParamList id="config-localization-languages" flexible />
					<div class="text project-label">{{ t('components.config-localization-default.label') }}</div
					><SelectBox id="config-localization-default" />
					<div class="text project-summary" id="config-other-summary">{{ t('components.config-other-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-preload.label') }}</div
					><SelectBox id="config-preload" />
					<div class="text project-label">{{ t('components.config-deadzone.label') }}</div
					><NumberBox
						id="config-deadzone"
						min="0"
						max="1"
						step="0.01"
						decimals="4"
					/>
				</div>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProjectSettingsWindow } from '@app/composables/useProjectSettingsWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/utils/attach-element-api';
import { getElementWriter } from '@app/utils/dom';
import KeyboardBox from '@app/components/common/KeyboardBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const settings = useProjectSettingsWindow();
const form = settings.form;

const inspector = useInspectorStore();
const local = useLocalStore();

const CONFIG_FIELDS = [
	'window-title',
	'window-width',
	'window-height',
	'window-display',
	'resolution-width',
	'resolution-height',
	'resolution-sceneScale',
	'resolution-uiScale',
	'scene-padding',
	'scene-animationInterval',
	'tileArea-expansionTop',
	'tileArea-expansionLeft',
	'tileArea-expansionRight',
	'tileArea-expansionBottom',
	'animationArea-expansionTop',
	'animationArea-expansionLeft',
	'animationArea-expansionRight',
	'animationArea-expansionBottom',
	'lightArea-expansionTop',
	'lightArea-expansionLeft',
	'lightArea-expansionRight',
	'lightArea-expansionBottom',
	'virtualAxis-up',
	'virtualAxis-down',
	'virtualAxis-left',
	'virtualAxis-right',
	'collision-actor-enabled',
	'collision-scene-enabled',
	'collision-scene-actorSize',
	'collision-trigger-collideWithActorShape',
	'text-importedFonts',
	'text-fontFamily',
	'text-highDefinition',
	'actor-tempAttributes',
	'animation-frameRate',
	'soundAttenuation-distance',
	'soundAttenuation-easingId',
	'webgl-desynchronized',
	'webgl-textureMagFilter',
	'webgl-textureMinFilter',
	'script-autoCompile',
	'save-location',
	'save-subdir',
	'localization-languages',
	'localization-default',
	'preload',
	'deadzone'
] as const;

const setForm = (data: Record<string, unknown>): void => {
	Object.assign(form, data);
	const write = getElementWriter('config', data);
	for (const field of CONFIG_FIELDS) {
		write(field);
	}
};

const getForm = (): Record<string, unknown> => {
	const data: Record<string, unknown> = {};
	for (const field of CONFIG_FIELDS) {
		const element = document.getElementById(`config-${field}`) as
			| (HTMLElement & { read?: () => unknown })
			| null;
		if (!element || typeof element.read !== 'function') continue;
		const keys = field.split('-');
		let node = data;
		for (let i = 0; i < keys.length - 1; i++) {
			const next = node[keys[i]] as Record<string, unknown> | undefined;
			if (next === undefined) {
				node = node[keys[i]] = {};
			} else {
				node = next;
			}
		}
		node[keys[keys.length - 1]] = element.read();
	}
	return data;
};

onMounted(() => {
	const el = document.getElementById('project-settings');
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}
});
</script>
