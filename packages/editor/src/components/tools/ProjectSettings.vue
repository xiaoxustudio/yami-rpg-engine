<template>
	<WindowFrame
		id="project-settings"
		:ref="registryRef(composableEls, 'project-settings')"
		buttons-id-prefix="project"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.project-settings.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="box" id="project-page">
			<div class="box" id="project-grid-box">
				<div class="text project-summary" id="config-window-summary">
					{{ t('components.config-window-summary.content') }}
				</div>
				<div class="text project-label">
					{{ t('components.config-window-title.label') }}
				</div>
				<TextBox
					id="config-window-title"
					:ref="registryRef(composableEls, 'config-window-title')"
					v-tip="t('components.config-window-title.tip')"
					v-model="form.window.title"
				/>
				<div class="text project-label">
					{{ t('components.config-window-width.label') }}
				</div>
				<NumberBox
					id="config-window-width"
					:ref="registryRef(composableEls, 'config-window-width')"
					v-tip="t('components.config-window-width.tip')"
					v-model="form.window.width"
					min="240"
					max="7680"
					unit="px"
				/>
				<div class="text project-label">
					{{ t('components.config-window-height.label') }}
				</div>
				<NumberBox
					id="config-window-height"
					:ref="registryRef(composableEls, 'config-window-height')"
					v-tip="t('components.config-window-height.tip')"
					v-model="form.window.height"
					min="240"
					max="7680"
					unit="px"
				/>
				<div class="text project-label">
					{{ t('components.config-window-display.label') }}
				</div>
				<SelectBox
					id="config-window-display"
					:ref="registryRef(composableEls, 'config-window-display')"
					v-tip="t('components.config-window-display.tip')"
					v-model="form.window.display"
				/>
				<div class="text project-summary" id="config-resolution-summary">
					{{ t('components.config-resolution-summary.content') }}
				</div>
				<div class="text project-label">
					{{ t('components.config-resolution-width.label') }}
				</div>
				<NumberBox
					id="config-resolution-width"
					:ref="registryRef(composableEls, 'config-resolution-width')"
					v-tip="t('components.config-resolution-width.tip')"
					v-model="form.resolution.width"
					min="240"
					max="7680"
					unit="px"
				/>
				<div class="text project-label">
					{{ t('components.config-resolution-height.label') }}
				</div>
				<NumberBox
					id="config-resolution-height"
					:ref="registryRef(composableEls, 'config-resolution-height')"
					v-tip="t('components.config-resolution-height.tip')"
					v-model="form.resolution.height"
					min="240"
					max="7680"
					unit="px"
				/>
				<div class="text project-label">
					{{ t('components.config-resolution-sceneScale.label') }}
				</div>
				<NumberBox
					id="config-resolution-sceneScale"
					:ref="registryRef(composableEls, 'config-resolution-sceneScale')"
					v-tip="t('components.config-resolution-sceneScale.tip')"
					v-model="form.resolution.sceneScale"
					min="0.5"
					max="8"
					decimals="10"
				/>
				<div class="text project-label">
					{{ t('components.config-resolution-uiScale.label') }}
				</div>
				<NumberBox
					id="config-resolution-uiScale"
					:ref="registryRef(composableEls, 'config-resolution-uiScale')"
					v-tip="t('components.config-resolution-uiScale.tip')"
					v-model="form.resolution.uiScale"
					min="0.5"
					max="4"
					decimals="10"
				/>
				<div class="text project-summary" id="config-scene-summary">
					{{ t('components.config-scene-summary.content') }}
				</div>
				<div class="text project-label">
					{{ t('components.config-scene-padding.label') }}
				</div>
				<NumberBox
					id="config-scene-padding"
					:ref="registryRef(composableEls, 'config-scene-padding')"
					v-tip="t('components.config-scene-padding.tip')"
					v-model="form.scene.padding"
					min="0"
					max="7680"
					unit="px"
				/>
				<div class="text project-label">
					{{ t('components.config-scene-animationInterval.label') }}
				</div>
				<NumberBox
					id="config-scene-animationInterval"
					:ref="registryRef(composableEls, 'config-scene-animationInterval')"
					v-tip="t('components.config-scene-animationInterval.tip')"
					v-model="form.scene.animationInterval"
					min="0"
					max="1000"
					unit="ms"
				/>
				<div class="text project-summary" id="config-tileArea-summary">
					{{ t('components.config-tileArea-summary.content') }}
				</div>
				<div class="text project-label">
					{{ t('components.config-tileArea-expansionTop.label') }}
				</div>
				<NumberBox
					id="config-tileArea-expansionTop"
					:ref="registryRef(composableEls, 'config-tileArea-expansionTop')"
					v-tip="t('components.config-tileArea-expansionTop.tip')"
					v-model="form.tileArea.expansionTop"
					min="0"
					max="400"
					unit="px"
				/>
				<div class="text project-label">
					{{ t('components.config-tileArea-expansionLeft.label') }}
				</div>
				<NumberBox
					id="config-tileArea-expansionLeft"
					:ref="registryRef(composableEls, 'config-tileArea-expansionLeft')"
					v-tip="t('components.config-tileArea-expansionLeft.tip')"
					v-model="form.tileArea.expansionLeft"
					min="0"
					max="400"
					unit="px"
				/>
				<div class="text project-label">
					{{ t('components.config-tileArea-expansionRight.label') }}
				</div>
				<NumberBox
					id="config-tileArea-expansionRight"
					:ref="registryRef(composableEls, 'config-tileArea-expansionRight')"
					v-tip="t('components.config-tileArea-expansionRight.tip')"
					v-model="form.tileArea.expansionRight"
					min="0"
					max="400"
					unit="px"
				/>
				<div class="text project-label">
					{{ t('components.config-tileArea-expansionBottom.label') }}
				</div>
				<NumberBox
					id="config-tileArea-expansionBottom"
					:ref="registryRef(composableEls, 'config-tileArea-expansionBottom')"
					v-tip="t('components.config-tileArea-expansionBottom.tip')"
					v-model="form.tileArea.expansionBottom"
					min="0"
					max="400"
					unit="px"
				/>
				<div class="text project-summary" id="config-animationArea-summary">
					{{ t('components.config-animationArea-summary.content') }}
				</div>
				<div class="text project-label">
					{{ t('components.config-animationArea-expansionTop.label') }}
				</div>
				<NumberBox
					id="config-animationArea-expansionTop"
					:ref="registryRef(composableEls, 'config-animationArea-expansionTop')"
					v-tip="t('components.config-animationArea-expansionTop.tip')"
					v-model="form.animationArea.expansionTop"
					min="0"
					max="800"
					unit="px"
				/>
				<div class="text project-label">
					{{ t('components.config-animationArea-expansionLeft.label') }}
				</div>
				<NumberBox
					id="config-animationArea-expansionLeft"
					:ref="registryRef(composableEls, 'config-animationArea-expansionLeft')"
					v-tip="t('components.config-animationArea-expansionLeft.tip')"
					v-model="form.animationArea.expansionLeft"
					min="0"
					max="800"
					unit="px"
				/>
				<div class="text project-label">
					{{ t('components.config-animationArea-expansionRight.label') }}
				</div>
				<NumberBox
					id="config-animationArea-expansionRight"
					:ref="registryRef(composableEls, 'config-animationArea-expansionRight')"
					v-tip="t('components.config-animationArea-expansionRight.tip')"
					v-model="form.animationArea.expansionRight"
					min="0"
					max="800"
					unit="px"
				/>
				<div class="text project-label">
					{{ t('components.config-animationArea-expansionBottom.label') }}
				</div>
				<NumberBox
					id="config-animationArea-expansionBottom"
					:ref="registryRef(composableEls, 'config-animationArea-expansionBottom')"
					v-tip="t('components.config-animationArea-expansionBottom.tip')"
					v-model="form.animationArea.expansionBottom"
					min="0"
					max="800"
					unit="px"
				/>
				<div class="text project-summary" id="config-lightArea-summary">
					{{ t('components.config-lightArea-summary.content') }}
				</div>
				<div class="text project-label">
					{{ t('components.config-lightArea-expansionTop.label') }}
				</div>
				<NumberBox
					id="config-lightArea-expansionTop"
					:ref="registryRef(composableEls, 'config-lightArea-expansionTop')"
					v-tip="t('components.config-lightArea-expansionTop.tip')"
					v-model="form.lightArea.expansionTop"
					min="0"
					max="400"
					unit="px"
				/>
				<div class="text project-label">
					{{ t('components.config-lightArea-expansionLeft.label') }}
				</div>
				<NumberBox
					id="config-lightArea-expansionLeft"
					:ref="registryRef(composableEls, 'config-lightArea-expansionLeft')"
					v-tip="t('components.config-lightArea-expansionLeft.tip')"
					v-model="form.lightArea.expansionLeft"
					min="0"
					max="400"
					unit="px"
				/>
				<div class="text project-label">
					{{ t('components.config-lightArea-expansionRight.label') }}
				</div>
				<NumberBox
					id="config-lightArea-expansionRight"
					:ref="registryRef(composableEls, 'config-lightArea-expansionRight')"
					v-tip="t('components.config-lightArea-expansionRight.tip')"
					v-model="form.lightArea.expansionRight"
					min="0"
					max="400"
					unit="px"
				/>
				<div class="text project-label">
					{{ t('components.config-lightArea-expansionBottom.label') }}
				</div>
				<NumberBox
					id="config-lightArea-expansionBottom"
					:ref="registryRef(composableEls, 'config-lightArea-expansionBottom')"
					v-tip="t('components.config-lightArea-expansionBottom.tip')"
					v-model="form.lightArea.expansionBottom"
					min="0"
					max="400"
					unit="px"
				/>
				<div class="text project-summary" id="config-virtualAxis-summary">
					{{ t('components.config-virtualAxis-summary.content') }}
				</div>
				<div class="text project-label">
					{{ t('components.config-virtualAxis-up.label') }}
				</div>
				<KeyboardBox
					id="config-virtualAxis-up"
					:ref="registryRef(composableEls, 'config-virtualAxis-up')"
					v-tip="t('components.config-virtualAxis-up.tip')"
					@input="form.virtualAxis.up = $event"
				/>
				<div class="text project-label">
					{{ t('components.config-virtualAxis-down.label') }}
				</div>
				<KeyboardBox
					id="config-virtualAxis-down"
					:ref="registryRef(composableEls, 'config-virtualAxis-down')"
					v-tip="t('components.config-virtualAxis-down.tip')"
					@input="form.virtualAxis.down = $event"
				/>
				<div class="text project-label">
					{{ t('components.config-virtualAxis-left.label') }}
				</div>
				<KeyboardBox
					id="config-virtualAxis-left"
					:ref="registryRef(composableEls, 'config-virtualAxis-left')"
					v-tip="t('components.config-virtualAxis-left.tip')"
					@input="form.virtualAxis.left = $event"
				/>
				<div class="text project-label">
					{{ t('components.config-virtualAxis-right.label') }}
				</div>
				<KeyboardBox
					id="config-virtualAxis-right"
					:ref="registryRef(composableEls, 'config-virtualAxis-right')"
					v-tip="t('components.config-virtualAxis-right.tip')"
					@input="form.virtualAxis.right = $event"
				/>
				<div class="text project-summary" id="config-collision-summary">
					{{ t('components.config-collision-summary.content') }}
				</div>
				<div class="text project-label">
					{{ t('components.config-collision-actor-enabled.label') }}
				</div>
				<SelectBox
					id="config-collision-actor-enabled"
					:ref="registryRef(composableEls, 'config-collision-actor-enabled')"
					v-tip="t('components.config-collision-actor-enabled.tip')"
					v-model="form.collision.actor.enabled"
				/>
				<div class="text project-label">
					{{ t('components.config-collision-scene-enabled.label') }}
				</div>
				<SelectBox
					id="config-collision-scene-enabled"
					:ref="registryRef(composableEls, 'config-collision-scene-enabled')"
					v-tip="t('components.config-collision-scene-enabled.tip')"
					v-model="form.collision.scene.enabled"
				/>
				<div class="text project-label">
					{{ t('components.config-collision-scene-actorSize.label') }}
				</div>
				<NumberBox
					id="config-collision-scene-actorSize"
					:ref="registryRef(composableEls, 'config-collision-scene-actorSize')"
					v-tip="t('components.config-collision-scene-actorSize.tip')"
					v-model="form.collision.scene.actorSize"
					min="0.5"
					max="1"
					step="0.1"
					decimals="4"
					unit="tile"
				/>
				<div class="text project-label">
					{{ t('components.config-collision-trigger-collideWithActorShape.label') }}
				</div>
				<SelectBox
					id="config-collision-trigger-collideWithActorShape"
					:ref="
						registryRef(composableEls, 'config-collision-trigger-collideWithActorShape')
					"
					v-tip="t('components.config-collision-trigger-collideWithActorShape.tip')"
					v-model="form.collision.trigger.collideWithActorShape"
				/>
				<div class="text project-summary" id="config-text-summary">
					{{ t('components.config-text-summary.content') }}
				</div>
				<div class="text project-label">
					{{ t('components.config-text-importedFonts.label') }}
				</div>
				<ParamList
					id="config-text-importedFonts"
					:ref="registryRef(composableEls, 'config-text-importedFonts')"
					v-tip="t('components.config-text-importedFonts.tip')"
					v-model="form.text.importedFonts"
					flexible
				/>
				<div class="text project-label">
					{{ t('components.config-text-fontFamily.label') }}
				</div>
				<TextBox
					id="config-text-fontFamily"
					:ref="registryRef(composableEls, 'config-text-fontFamily')"
					v-tip="t('components.config-text-fontFamily.tip')"
					v-model="form.text.fontFamily"
				/>
				<div class="text project-label">
					{{ t('components.config-text-highDefinition.label') }}
				</div>
				<SelectBox
					id="config-text-highDefinition"
					:ref="registryRef(composableEls, 'config-text-highDefinition')"
					v-tip="t('components.config-text-highDefinition.tip')"
					v-model="form.text.highDefinition"
				/>
				<div class="text project-summary" id="config-actor-summary">
					{{ t('components.config-actor-summary.content') }}
				</div>
				<div class="text project-label">
					{{ t('components.config-actor-tempAttributes.label') }}
				</div>
				<ParamList
					id="config-actor-tempAttributes"
					:ref="registryRef(composableEls, 'config-actor-tempAttributes')"
					v-tip="t('components.config-actor-tempAttributes.tip')"
					v-model="form.actor.tempAttributes"
					group="actor"
					flexible
				/>
				<div class="text project-summary" id="config-animation-summary">
					{{ t('components.config-animation-summary.content') }}
				</div>
				<div class="text project-label">
					{{ t('components.config-animation-frameRate.label') }}
				</div>
				<NumberBox
					id="config-animation-frameRate"
					:ref="registryRef(composableEls, 'config-animation-frameRate')"
					v-tip="t('components.config-animation-frameRate.tip')"
					v-model="form.animation.frameRate"
					min="1"
					max="240"
					unit="fps"
				/>
				<div class="text project-summary" id="config-soundAttenuation-summary">
					{{ t('components.config-soundAttenuation-summary.content') }}
				</div>
				<div class="text project-label">
					{{ t('components.config-soundAttenuation-distance.label') }}
				</div>
				<NumberBox
					id="config-soundAttenuation-distance"
					:ref="registryRef(composableEls, 'config-soundAttenuation-distance')"
					v-tip="t('components.config-soundAttenuation-distance.tip')"
					v-model="form.soundAttenuation.distance"
					min="0"
					max="100"
					unit="tile"
				/>
				<div class="text project-label">
					{{ t('components.config-soundAttenuation-easingId.label') }}
				</div>
				<SelectBox
					id="config-soundAttenuation-easingId"
					:ref="registryRef(composableEls, 'config-soundAttenuation-easingId')"
					v-tip="t('components.config-soundAttenuation-easingId.tip')"
					v-model="form.soundAttenuation.easingId"
				/>
				<div class="text project-summary" id="config-webgl-summary">
					{{ t('components.config-webgl-summary.content') }}
				</div>
				<div class="text project-label">
					{{ t('components.config-webgl-desynchronized.label') }}
				</div>
				<SelectBox
					id="config-webgl-desynchronized"
					:ref="registryRef(composableEls, 'config-webgl-desynchronized')"
					v-tip="t('components.config-webgl-desynchronized.tip')"
					v-model="form.webgl.desynchronized"
				/>
				<div class="text project-label">
					{{ t('components.config-webgl-textureMagFilter.label') }}
				</div>
				<SelectBox
					id="config-webgl-textureMagFilter"
					:ref="registryRef(composableEls, 'config-webgl-textureMagFilter')"
					v-tip="t('components.config-webgl-textureMagFilter.tip')"
					v-model="form.webgl.textureMagFilter"
				/>
				<div class="text project-label">
					{{ t('components.config-webgl-textureMinFilter.label') }}
				</div>
				<SelectBox
					id="config-webgl-textureMinFilter"
					:ref="registryRef(composableEls, 'config-webgl-textureMinFilter')"
					v-tip="t('components.config-webgl-textureMinFilter.tip')"
					v-model="form.webgl.textureMinFilter"
				/>
				<div class="text project-summary" id="config-script-summary">
					{{ t('components.config-script-summary.content') }}
				</div>
				<div class="text project-label">
					{{ t('components.config-script-autoCompile.label') }}
				</div>
				<SelectBox
					id="config-script-autoCompile"
					:ref="registryRef(composableEls, 'config-script-autoCompile')"
					v-tip="t('components.config-script-autoCompile.tip')"
					v-model="form.script.autoCompile"
				/>
				<div class="text project-summary" id="config-save-summary">
					{{ t('components.config-save-summary.content') }}
				</div>
				<div class="text project-label">
					{{ t('components.config-save-location.label') }}
				</div>
				<SelectBox
					id="config-save-location"
					:ref="registryRef(composableEls, 'config-save-location')"
					v-tip="t('components.config-save-location.tip')"
					v-model="form.save.location"
				/>
				<div class="text project-label">{{ t('components.config-save-subdir.label') }}</div>
				<TextBox
					id="config-save-subdir"
					:ref="registryRef(composableEls, 'config-save-subdir')"
					v-tip="t('components.config-save-subdir.tip')"
					v-model="form.save.subdir"
				/>
				<div class="text project-summary" id="config-localization-summary">
					{{ t('components.config-localization-summary.content') }}
				</div>
				<div class="text project-label">
					{{ t('components.config-localization-languages.label') }}
				</div>
				<ParamList
					id="config-localization-languages"
					:ref="registryRef(composableEls, 'config-localization-languages')"
					v-tip="t('components.config-localization-languages.tip')"
					v-model="form.localization.languages"
					flexible
				/>
				<div class="text project-label">
					{{ t('components.config-localization-default.label') }}
				</div>
				<SelectBox
					id="config-localization-default"
					:ref="registryRef(composableEls, 'config-localization-default')"
					v-tip="t('components.config-localization-default.tip')"
					v-model="form.localization.default"
				/>
				<div class="text project-summary" id="config-other-summary">
					{{ t('components.config-other-summary.content') }}
				</div>
				<div class="text project-label">{{ t('components.config-preload.label') }}</div>
				<SelectBox
					id="config-preload"
					:ref="registryRef(composableEls, 'config-preload')"
					v-tip="t('components.config-preload.tip')"
					v-model="form.preload"
				/>
				<div class="text project-label">{{ t('components.config-deadzone.label') }}</div>
				<NumberBox
					id="config-deadzone"
					:ref="registryRef(composableEls, 'config-deadzone')"
					v-tip="t('components.config-deadzone.tip')"
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
import { composableEls } from '@app/composables/element-registry';
import { registryRef } from '@app/utils/element-registry';
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

// 确认按钮由 WindowFrame → YMFormButtons 生成（模板里没有、注册表取不到）→ 由 SFC 的 @confirm 驱动
const onConfirm = () => {
	settings.confirm();
};
</script>

<style>
/* 窗口样式迁移：由 Project/css/ui.css 迁入组件（选择器为全局 id，不能用 scoped） */
#project-settings {
	width: 480px;
	height: 700px;
}

/* 样式迁移：由 Project/css/ui.css 迁入组件（选择器为全局 id，不能用 scoped） */
#project-page {
	position: absolute;
	top: 0;
	bottom: 40px;
	width: 100%;
	overflow-x: hidden;
	overflow-y: scroll;
	/* background-color: green; */
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
