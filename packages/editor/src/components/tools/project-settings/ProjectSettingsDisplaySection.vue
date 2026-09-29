<template>
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
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { composableEls } from '@app/composables/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useProjectSettingsWindow } from '@app/composables/useProjectSettingsWindow';
import TextBox from '@app/components/common/TextBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();
const { form } = useProjectSettingsWindow();
</script>
