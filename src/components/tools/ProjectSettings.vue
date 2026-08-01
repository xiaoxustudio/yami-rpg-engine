<template>
		<window-frame id="project-settings">
		<title-bar>Project Settings<close></close></title-bar>
		<content-frame>
			<box id="project-page">
				<box id="project-grid-box">
					<text id="config-window-summary" class="project-summary">Window</text>
					<text class="project-label">Title</text
					><text-box id="config-window-title" />
					<text class="project-label">Width</text
					><number-box id="config-window-width" min="240" max="7680" unit="px" />
					<text class="project-label">Height</text
					><number-box id="config-window-height" min="240" max="7680" unit="px" />
					<text class="project-label">Display</text
					><select-box id="config-window-display" />
					<text id="config-resolution-summary" class="project-summary"
						>Virtual Resolution</text
					>
					<text class="project-label">Width</text
					><number-box
						id="config-resolution-width"
						min="240"
						max="7680"
						unit="px"
					/>
					<text class="project-label">Height</text
					><number-box
						id="config-resolution-height"
						min="240"
						max="7680"
						unit="px"
					/>
					<text class="project-label">Scene Scale</text
					><number-box
						id="config-resolution-sceneScale"
						min="0.5"
						max="8"
						decimals="10"
					/>
					<text class="project-label">UI Scale</text
					><number-box
						id="config-resolution-uiScale"
						min="0.5"
						max="4"
						decimals="10"
					/>
					<text id="config-scene-summary" class="project-summary">Scene</text>
					<text class="project-label">Padding</text
					><number-box id="config-scene-padding" min="0" max="7680" unit="px" />
					<text class="project-label">Tile Animation Interval</text
					><number-box
						id="config-scene-animationInterval"
						min="0"
						max="1000"
						unit="ms"
					/>
					<text id="config-tileArea-summary" class="project-summary"
						>Tile Rendering Area</text
					>
					<text class="project-label">Expansion Top</text
					><number-box
						id="config-tileArea-expansionTop"
						min="0"
						max="400"
						unit="px"
					/>
					<text class="project-label">Expansion Left</text
					><number-box
						id="config-tileArea-expansionLeft"
						min="0"
						max="400"
						unit="px"
					/>
					<text class="project-label">Expansion Right</text
					><number-box
						id="config-tileArea-expansionRight"
						min="0"
						max="400"
						unit="px"
					/>
					<text class="project-label">Expansion Bottom</text
					><number-box
						id="config-tileArea-expansionBottom"
						min="0"
						max="400"
						unit="px"
					/>
					<text id="config-animationArea-summary" class="project-summary"
						>Animation Rendering Area</text
					>
					<text class="project-label">Expansion Top</text
					><number-box
						id="config-animationArea-expansionTop"
						min="0"
						max="800"
						unit="px"
					/>
					<text class="project-label">Expansion Left</text
					><number-box
						id="config-animationArea-expansionLeft"
						min="0"
						max="800"
						unit="px"
					/>
					<text class="project-label">Expansion Right</text
					><number-box
						id="config-animationArea-expansionRight"
						min="0"
						max="800"
						unit="px"
					/>
					<text class="project-label">Expansion Bottom</text
					><number-box
						id="config-animationArea-expansionBottom"
						min="0"
						max="800"
						unit="px"
					/>
					<text id="config-lightArea-summary" class="project-summary"
						>Light Rendering Area</text
					>
					<text class="project-label">Expansion Top</text
					><number-box
						id="config-lightArea-expansionTop"
						min="0"
						max="400"
						unit="px"
					/>
					<text class="project-label">Expansion Left</text
					><number-box
						id="config-lightArea-expansionLeft"
						min="0"
						max="400"
						unit="px"
					/>
					<text class="project-label">Expansion Right</text
					><number-box
						id="config-lightArea-expansionRight"
						min="0"
						max="400"
						unit="px"
					/>
					<text class="project-label">Expansion Bottom</text
					><number-box
						id="config-lightArea-expansionBottom"
						min="0"
						max="400"
						unit="px"
					/>
					<text id="config-virtualAxis-summary" class="project-summary">Virtual Axis</text>
					<text class="project-label">Axis Up</text
					><keyboard-box id="config-virtualAxis-up" />
					<text class="project-label">Axis Down</text
					><keyboard-box id="config-virtualAxis-down" />
					<text class="project-label">Axis Left</text
					><keyboard-box id="config-virtualAxis-left" />
					<text class="project-label">Axis Right</text
					><keyboard-box id="config-virtualAxis-right" />
					<text id="config-collision-summary" class="project-summary">Collision System</text>
					<text class="project-label">Actor Collision</text
					><select-box id="config-collision-actor-enabled" />
					<text class="project-label">Scene Collision</text
					><select-box id="config-collision-scene-enabled" />
					<text class="project-label">Scene Collision Size</text
					><number-box
						id="config-collision-scene-actorSize"
						min="0.5"
						max="1"
						step="0.1"
						decimals="4"
						unit="tile"
					/>
					<text class="project-label">Trigger Collision Mode</text
					><select-box id="config-collision-trigger-collideWithActorShape" />
					<text id="config-text-summary" class="project-summary">Text</text>
					<text class="project-label">Imported Fonts</text
					><param-list id="config-text-importedFonts" flexible />
					<text class="project-label">Default Font Family</text
					><text-box id="config-text-fontFamily" />
					<text class="project-label">High Definition</text
					><select-box id="config-text-highDefinition" />
					<text id="config-actor-summary" class="project-summary">Actor</text>
					<text class="project-label">Temporary Attributes</text
					><param-list id="config-actor-tempAttributes" group="actor" flexible />
					<text id="config-animation-summary" class="project-summary">Animation</text>
					<text class="project-label">Frame Rate</text
					><number-box
						id="config-animation-frameRate"
						min="1"
						max="240"
						unit="fps"
					/>
					<text id="config-soundAttenuation-summary" class="project-summary"
						>Sound Attenuation</text
					>
					<text class="project-label">Attenuation Distance</text
					><number-box
						id="config-soundAttenuation-distance"
						min="0"
						max="100"
						unit="tile"
					/>
					<text class="project-label">Attenuation Easing</text
					><select-box id="config-soundAttenuation-easingId" />
					<text id="config-webgl-summary" class="project-summary">WebGL</text>
					<text class="project-label">Low Latency Mode</text
					><select-box id="config-webgl-desynchronized" />
					<text class="project-label">Texture Mag Filter</text
					><select-box id="config-webgl-textureMagFilter" />
					<text class="project-label">Texture Min Filter</text
					><select-box id="config-webgl-textureMinFilter" />
					<text id="config-script-summary" class="project-summary">Script</text>
					<text class="project-label">Auto Compile</text
					><select-box id="config-script-autoCompile" />
					<text id="config-save-summary" class="project-summary">Save</text>
					<text class="project-label">Save Location</text
					><select-box id="config-save-location" />
					<text class="project-label">Subdirectory</text
					><text-box id="config-save-subdir" />
					<text id="config-localization-summary" class="project-summary">Localization</text>
					<text class="project-label">Languages</text
					><param-list id="config-localization-languages" flexible />
					<text class="project-label">Default Game Language</text
					><select-box id="config-localization-default" />
					<text id="config-other-summary" class="project-summary">Other Options</text>
					<text class="project-label">Preload Files</text
					><select-box id="config-preload" />
					<text class="project-label">dead Zone</text
					><number-box
						id="config-deadzone"
						min="0"
						max="1"
						step="0.01"
						decimals="4"
					/>
				</box>
			</box>
			<button id="project-confirm" name="confirm">Confirm</button>
			<button id="project-cancel" name="cancel">Cancel</button>
		</content-frame>
	</window-frame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
