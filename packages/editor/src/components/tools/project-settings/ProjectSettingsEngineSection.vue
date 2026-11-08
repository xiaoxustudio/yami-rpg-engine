<template>
	<div class="text project-summary" id="config-webgl-summary">
		{{ t('components.config-webgl-summary.content') }}
	</div>
	<div class="text project-label">
		{{ t('components.config-webgl-desynchronized.label') }}
	</div>
	<SelectBox
		id="config-webgl-desynchronized"
		:ref="controlRef('config-webgl-desynchronized')"
		v-tip="t('components.config-webgl-desynchronized.tip')"
		v-model="form.webgl.desynchronized"
	/>
	<div class="text project-label">
		{{ t('components.config-webgl-textureMagFilter.label') }}
	</div>
	<SelectBox
		id="config-webgl-textureMagFilter"
		:ref="controlRef('config-webgl-textureMagFilter')"
		v-tip="t('components.config-webgl-textureMagFilter.tip')"
		v-model="form.webgl.textureMagFilter"
	/>
	<div class="text project-label">
		{{ t('components.config-webgl-textureMinFilter.label') }}
	</div>
	<SelectBox
		id="config-webgl-textureMinFilter"
		:ref="controlRef('config-webgl-textureMinFilter')"
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
		:ref="controlRef('config-script-autoCompile')"
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
		:ref="controlRef('config-save-location')"
		v-tip="t('components.config-save-location.tip')"
		v-model="form.save.location"
	/>
	<div class="text project-label">{{ t('components.config-save-subdir.label') }}</div>
	<TextBox
		id="config-save-subdir"
		:ref="controlRef('config-save-subdir')"
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
		:ref="controlRef('config-localization-languages')"
		v-tip="t('components.config-localization-languages.tip')"
		v-model="form.localization.languages"
		flexible
	/>
	<div class="text project-label">
		{{ t('components.config-localization-default.label') }}
	</div>
	<SelectBox
		id="config-localization-default"
		:ref="controlRef('config-localization-default')"
		v-tip="t('components.config-localization-default.tip')"
		v-model="form.localization.default"
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
import SelectBox from '@app/components/common/SelectBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'config-localization-default'
	| 'config-localization-languages'
	| 'config-save-location'
	| 'config-save-subdir'
	| 'config-script-autoCompile'
	| 'config-webgl-desynchronized'
	| 'config-webgl-textureMagFilter'
	| 'config-webgl-textureMinFilter';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();
const { form } = useProjectSettingsWindow();

onMounted(() => registerProjectSettingsControls(controls));
onUnmounted(() => resetProjectSettingsControls(controls));
</script>
