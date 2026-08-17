<template>
		<WindowFrame id="project-settings" buttons-id-prefix="project">
		<template #title><TitleBar>Project Settings<div class="close"></div></TitleBar></template>
		
			<div class="box" id="project-page">
				<div class="box" id="project-grid-box">
					<div class="text project-summary" id="config-window-summary">Window</div>
					<div class="text project-label">Title</div
					><TextBox id="config-window-title" />
					<div class="text project-label">Width</div
					><NumberBox id="config-window-width" min="240" max="7680" unit="px" />
					<div class="text project-label">Height</div
					><NumberBox id="config-window-height" min="240" max="7680" unit="px" />
					<div class="text project-label">Display</div
					><SelectBox id="config-window-display" />
					<div class="text project-summary" id="config-resolution-summary"
						>Virtual Resolution</div
					>
					<div class="text project-label">Width</div
					><NumberBox
						id="config-resolution-width"
						min="240"
						max="7680"
						unit="px"
					/>
					<div class="text project-label">Height</div
					><NumberBox
						id="config-resolution-height"
						min="240"
						max="7680"
						unit="px"
					/>
					<div class="text project-label">Scene Scale</div
					><NumberBox
						id="config-resolution-sceneScale"
						min="0.5"
						max="8"
						decimals="10"
					/>
					<div class="text project-label">UI Scale</div
					><NumberBox
						id="config-resolution-uiScale"
						min="0.5"
						max="4"
						decimals="10"
					/>
					<div class="text project-summary" id="config-scene-summary">Scene</div>
					<div class="text project-label">Padding</div
					><NumberBox id="config-scene-padding" min="0" max="7680" unit="px" />
					<div class="text project-label">Tile Animation Interval</div
					><NumberBox
						id="config-scene-animationInterval"
						min="0"
						max="1000"
						unit="ms"
					/>
					<div class="text project-summary" id="config-tileArea-summary"
						>Tile Rendering Area</div
					>
					<div class="text project-label">Expansion Top</div
					><NumberBox
						id="config-tileArea-expansionTop"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-label">Expansion Left</div
					><NumberBox
						id="config-tileArea-expansionLeft"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-label">Expansion Right</div
					><NumberBox
						id="config-tileArea-expansionRight"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-label">Expansion Bottom</div
					><NumberBox
						id="config-tileArea-expansionBottom"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-summary" id="config-animationArea-summary"
						>Animation Rendering Area</div
					>
					<div class="text project-label">Expansion Top</div
					><NumberBox
						id="config-animationArea-expansionTop"
						min="0"
						max="800"
						unit="px"
					/>
					<div class="text project-label">Expansion Left</div
					><NumberBox
						id="config-animationArea-expansionLeft"
						min="0"
						max="800"
						unit="px"
					/>
					<div class="text project-label">Expansion Right</div
					><NumberBox
						id="config-animationArea-expansionRight"
						min="0"
						max="800"
						unit="px"
					/>
					<div class="text project-label">Expansion Bottom</div
					><NumberBox
						id="config-animationArea-expansionBottom"
						min="0"
						max="800"
						unit="px"
					/>
					<div class="text project-summary" id="config-lightArea-summary"
						>Light Rendering Area</div
					>
					<div class="text project-label">Expansion Top</div
					><NumberBox
						id="config-lightArea-expansionTop"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-label">Expansion Left</div
					><NumberBox
						id="config-lightArea-expansionLeft"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-label">Expansion Right</div
					><NumberBox
						id="config-lightArea-expansionRight"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-label">Expansion Bottom</div
					><NumberBox
						id="config-lightArea-expansionBottom"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-summary" id="config-virtualAxis-summary">Virtual Axis</div>
					<div class="text project-label">Axis Up</div
					><KeyboardBox id="config-virtualAxis-up" />
					<div class="text project-label">Axis Down</div
					><KeyboardBox id="config-virtualAxis-down" />
					<div class="text project-label">Axis Left</div
					><KeyboardBox id="config-virtualAxis-left" />
					<div class="text project-label">Axis Right</div
					><KeyboardBox id="config-virtualAxis-right" />
					<div class="text project-summary" id="config-collision-summary">Collision System</div>
					<div class="text project-label">Actor Collision</div
					><SelectBox id="config-collision-actor-enabled" />
					<div class="text project-label">Scene Collision</div
					><SelectBox id="config-collision-scene-enabled" />
					<div class="text project-label">Scene Collision Size</div
					><NumberBox
						id="config-collision-scene-actorSize"
						min="0.5"
						max="1"
						step="0.1"
						decimals="4"
						unit="tile"
					/>
					<div class="text project-label">Trigger Collision Mode</div
					><SelectBox id="config-collision-trigger-collideWithActorShape" />
					<div class="text project-summary" id="config-text-summary">Text</div>
					<div class="text project-label">Imported Fonts</div
					><ParamList id="config-text-importedFonts" flexible />
					<div class="text project-label">Default Font Family</div
					><TextBox id="config-text-fontFamily" />
					<div class="text project-label">High Definition</div
					><SelectBox id="config-text-highDefinition" />
					<div class="text project-summary" id="config-actor-summary">Actor</div>
					<div class="text project-label">Temporary Attributes</div
					><ParamList id="config-actor-tempAttributes" group="actor" flexible />
					<div class="text project-summary" id="config-animation-summary">Animation</div>
					<div class="text project-label">Frame Rate</div
					><NumberBox
						id="config-animation-frameRate"
						min="1"
						max="240"
						unit="fps"
					/>
					<div class="text project-summary" id="config-soundAttenuation-summary"
						>Sound Attenuation</div
					>
					<div class="text project-label">Attenuation Distance</div
					><NumberBox
						id="config-soundAttenuation-distance"
						min="0"
						max="100"
						unit="tile"
					/>
					<div class="text project-label">Attenuation Easing</div
					><SelectBox id="config-soundAttenuation-easingId" />
					<div class="text project-summary" id="config-webgl-summary">WebGL</div>
					<div class="text project-label">Low Latency Mode</div
					><SelectBox id="config-webgl-desynchronized" />
					<div class="text project-label">Texture Mag Filter</div
					><SelectBox id="config-webgl-textureMagFilter" />
					<div class="text project-label">Texture Min Filter</div
					><SelectBox id="config-webgl-textureMinFilter" />
					<div class="text project-summary" id="config-script-summary">Script</div>
					<div class="text project-label">Auto Compile</div
					><SelectBox id="config-script-autoCompile" />
					<div class="text project-summary" id="config-save-summary">Save</div>
					<div class="text project-label">Save Location</div
					><SelectBox id="config-save-location" />
					<div class="text project-label">Subdirectory</div
					><TextBox id="config-save-subdir" />
					<div class="text project-summary" id="config-localization-summary">Localization</div>
					<div class="text project-label">Languages</div
					><ParamList id="config-localization-languages" flexible />
					<div class="text project-label">Default Game Language</div
					><SelectBox id="config-localization-default" />
					<div class="text project-summary" id="config-other-summary">Other Options</div>
					<div class="text project-label">Preload Files</div
					><SelectBox id="config-preload" />
					<div class="text project-label">dead Zone</div
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
import { useProjectSettingsWindow } from '@app/composables/useProjectSettingsWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import { getElementWriter } from '@app/legacy/util/dom.ts';
import KeyboardBox from '@app/components/common/KeyboardBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

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
