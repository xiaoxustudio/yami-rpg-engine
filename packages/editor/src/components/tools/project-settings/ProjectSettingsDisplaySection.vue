<template>
	<div class="text project-summary" id="config-window-summary">
		{{ t('components.config-window-summary.content') }}
	</div>
	<div class="text project-label">
		{{ t('components.config-window-title.label') }}
	</div>
	<TextBox
		id="config-window-title"
		:ref="controlRef('config-window-title')"
		v-tip="t('components.config-window-title.tip')"
		v-model="form.window.title"
	/>
	<div class="text project-label">
		{{ t('components.config-window-width.label') }}
	</div>
	<NumberBox
		id="config-window-width"
		:ref="controlRef('config-window-width')"
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
		:ref="controlRef('config-window-height')"
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
		:ref="controlRef('config-window-display')"
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
		:ref="controlRef('config-resolution-width')"
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
		:ref="controlRef('config-resolution-height')"
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
		:ref="controlRef('config-resolution-sceneScale')"
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
		:ref="controlRef('config-resolution-uiScale')"
		v-tip="t('components.config-resolution-uiScale.tip')"
		v-model="form.resolution.uiScale"
		min="0.5"
		max="4"
		decimals="10"
	/>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useControlRefs } from '@app/composables/control-refs';
import {
	registerProjectSettingsControls,
	resetProjectSettingsControls
} from '@app/composables/project-settings-controls';
import { useProjectSettingsWindow } from '@app/composables/useProjectSettingsWindow';
import TextBox from '@app/components/common/TextBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'config-resolution-height'
	| 'config-resolution-sceneScale'
	| 'config-resolution-uiScale'
	| 'config-resolution-width'
	| 'config-window-display'
	| 'config-window-height'
	| 'config-window-title'
	| 'config-window-width';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();
const { form } = useProjectSettingsWindow();

onMounted(() => registerProjectSettingsControls(controls));
onUnmounted(() => resetProjectSettingsControls(controls));
</script>
