<template>
		<WindowFrame id="project-settings" buttons-id-prefix="project">
		<template #title><TitleBar>{{ t('components.project-settings.title') }}<div class="close"></div></TitleBar></template>
		
			<div class="box" id="project-page">
				<div class="box" id="project-grid-box">
					<div class="text project-summary" id="config-window-summary">{{ t('components.config-window-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-window-title.label') }}</div
					><TextBox id="config-window-title" v-model="form.window.title" />
					<div class="text project-label">{{ t('components.config-window-width.label') }}</div
					><NumberBox id="config-window-width" v-model="form.window.width" min="240" max="7680" unit="px" />
					<div class="text project-label">{{ t('components.config-window-height.label') }}</div
					><NumberBox id="config-window-height" v-model="form.window.height" min="240" max="7680" unit="px" />
					<div class="text project-label">{{ t('components.config-window-display.label') }}</div
					><SelectBox id="config-window-display" v-model="form.window.display" />
					<div class="text project-summary" id="config-resolution-summary"
						>{{ t('components.config-resolution-summary.content') }}</div
					>
					<div class="text project-label">{{ t('components.config-resolution-width.label') }}</div
					><NumberBox
						id="config-resolution-width"
						v-model="form.resolution.width"
						min="240"
						max="7680"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-resolution-height.label') }}</div
					><NumberBox
						id="config-resolution-height"
						v-model="form.resolution.height"
						min="240"
						max="7680"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-resolution-sceneScale.label') }}</div
					><NumberBox
						id="config-resolution-sceneScale"
						v-model="form.resolution.sceneScale"
						min="0.5"
						max="8"
						decimals="10"
					/>
					<div class="text project-label">{{ t('components.config-resolution-uiScale.label') }}</div
					><NumberBox
						id="config-resolution-uiScale"
						v-model="form.resolution.uiScale"
						min="0.5"
						max="4"
						decimals="10"
					/>
					<div class="text project-summary" id="config-scene-summary">{{ t('components.config-scene-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-scene-padding.label') }}</div
					><NumberBox id="config-scene-padding" v-model="form.scene.padding" min="0" max="7680" unit="px" />
					<div class="text project-label">{{ t('components.config-scene-animationInterval.label') }}</div
					><NumberBox
						id="config-scene-animationInterval"
						v-model="form.scene.animationInterval"
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
						v-model="form.tileArea.expansionTop"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-tileArea-expansionLeft.label') }}</div
					><NumberBox
						id="config-tileArea-expansionLeft"
						v-model="form.tileArea.expansionLeft"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-tileArea-expansionRight.label') }}</div
					><NumberBox
						id="config-tileArea-expansionRight"
						v-model="form.tileArea.expansionRight"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-tileArea-expansionBottom.label') }}</div
					><NumberBox
						id="config-tileArea-expansionBottom"
						v-model="form.tileArea.expansionBottom"
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
						v-model="form.animationArea.expansionTop"
						min="0"
						max="800"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-animationArea-expansionLeft.label') }}</div
					><NumberBox
						id="config-animationArea-expansionLeft"
						v-model="form.animationArea.expansionLeft"
						min="0"
						max="800"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-animationArea-expansionRight.label') }}</div
					><NumberBox
						id="config-animationArea-expansionRight"
						v-model="form.animationArea.expansionRight"
						min="0"
						max="800"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-animationArea-expansionBottom.label') }}</div
					><NumberBox
						id="config-animationArea-expansionBottom"
						v-model="form.animationArea.expansionBottom"
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
						v-model="form.lightArea.expansionTop"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-lightArea-expansionLeft.label') }}</div
					><NumberBox
						id="config-lightArea-expansionLeft"
						v-model="form.lightArea.expansionLeft"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-lightArea-expansionRight.label') }}</div
					><NumberBox
						id="config-lightArea-expansionRight"
						v-model="form.lightArea.expansionRight"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-label">{{ t('components.config-lightArea-expansionBottom.label') }}</div
					><NumberBox
						id="config-lightArea-expansionBottom"
						v-model="form.lightArea.expansionBottom"
						min="0"
						max="400"
						unit="px"
					/>
					<div class="text project-summary" id="config-virtualAxis-summary">{{ t('components.config-virtualAxis-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-virtualAxis-up.label') }}</div
					><KeyboardBox id="config-virtualAxis-up" @input="form.virtualAxis.up = $event" />
					<div class="text project-label">{{ t('components.config-virtualAxis-down.label') }}</div
					><KeyboardBox id="config-virtualAxis-down" @input="form.virtualAxis.down = $event" />
					<div class="text project-label">{{ t('components.config-virtualAxis-left.label') }}</div
					><KeyboardBox id="config-virtualAxis-left" @input="form.virtualAxis.left = $event" />
					<div class="text project-label">{{ t('components.config-virtualAxis-right.label') }}</div
					><KeyboardBox id="config-virtualAxis-right" @input="form.virtualAxis.right = $event" />
					<div class="text project-summary" id="config-collision-summary">{{ t('components.config-collision-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-collision-actor-enabled.label') }}</div
					><SelectBox id="config-collision-actor-enabled" v-model="form.collision.actor.enabled" />
					<div class="text project-label">{{ t('components.config-collision-scene-enabled.label') }}</div
					><SelectBox id="config-collision-scene-enabled" v-model="form.collision.scene.enabled" />
					<div class="text project-label">{{ t('components.config-collision-scene-actorSize.label') }}</div
					><NumberBox
						id="config-collision-scene-actorSize"
						v-model="form.collision.scene.actorSize"
						min="0.5"
						max="1"
						step="0.1"
						decimals="4"
						unit="tile"
					/>
					<div class="text project-label">{{ t('components.config-collision-trigger-collideWithActorShape.label') }}</div
					><SelectBox id="config-collision-trigger-collideWithActorShape" v-model="form.collision.trigger.collideWithActorShape" />
					<div class="text project-summary" id="config-text-summary">{{ t('components.config-text-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-text-importedFonts.label') }}</div
					><ParamList id="config-text-importedFonts" v-model="form.text.importedFonts" flexible />
					<div class="text project-label">{{ t('components.config-text-fontFamily.label') }}</div
					><TextBox id="config-text-fontFamily" v-model="form.text.fontFamily" />
					<div class="text project-label">{{ t('components.config-text-highDefinition.label') }}</div
					><SelectBox id="config-text-highDefinition" v-model="form.text.highDefinition" />
					<div class="text project-summary" id="config-actor-summary">{{ t('components.config-actor-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-actor-tempAttributes.label') }}</div
					><ParamList id="config-actor-tempAttributes" v-model="form.actor.tempAttributes" group="actor" flexible />
					<div class="text project-summary" id="config-animation-summary">{{ t('components.config-animation-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-animation-frameRate.label') }}</div
					><NumberBox
						id="config-animation-frameRate"
						v-model="form.animation.frameRate"
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
						v-model="form.soundAttenuation.distance"
						min="0"
						max="100"
						unit="tile"
					/>
					<div class="text project-label">{{ t('components.config-soundAttenuation-easingId.label') }}</div
					><SelectBox id="config-soundAttenuation-easingId" v-model="form.soundAttenuation.easingId" />
					<div class="text project-summary" id="config-webgl-summary">{{ t('components.config-webgl-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-webgl-desynchronized.label') }}</div
					><SelectBox id="config-webgl-desynchronized" v-model="form.webgl.desynchronized" />
					<div class="text project-label">{{ t('components.config-webgl-textureMagFilter.label') }}</div
					><SelectBox id="config-webgl-textureMagFilter" v-model="form.webgl.textureMagFilter" />
					<div class="text project-label">{{ t('components.config-webgl-textureMinFilter.label') }}</div
					><SelectBox id="config-webgl-textureMinFilter" v-model="form.webgl.textureMinFilter" />
					<div class="text project-summary" id="config-script-summary">{{ t('components.config-script-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-script-autoCompile.label') }}</div
					><SelectBox id="config-script-autoCompile" v-model="form.script.autoCompile" />
					<div class="text project-summary" id="config-save-summary">{{ t('components.config-save-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-save-location.label') }}</div
					><SelectBox id="config-save-location" v-model="form.save.location" />
					<div class="text project-label">{{ t('components.config-save-subdir.label') }}</div
					><TextBox id="config-save-subdir" v-model="form.save.subdir" />
					<div class="text project-summary" id="config-localization-summary">{{ t('components.config-localization-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-localization-languages.label') }}</div
					><ParamList id="config-localization-languages" v-model="form.localization.languages" flexible />
					<div class="text project-label">{{ t('components.config-localization-default.label') }}</div
					><SelectBox id="config-localization-default" v-model="form.localization.default" />
					<div class="text project-summary" id="config-other-summary">{{ t('components.config-other-summary.content') }}</div>
					<div class="text project-label">{{ t('components.config-preload.label') }}</div
					><SelectBox id="config-preload" v-model="form.preload" />
					<div class="text project-label">{{ t('components.config-deadzone.label') }}</div
					><NumberBox
						id="config-deadzone"
						v-model="form.deadzone"
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
import { useI18n } from 'vue-i18n';
import { useProjectSettingsWindow } from '@app/composables/useProjectSettingsWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import KeyboardBox from '@app/components/common/KeyboardBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const settings = useProjectSettingsWindow();
const form = settings.form;
</script>
