<template>
	<div class="text project-summary" id="config-other-summary">
		{{ t('components.config-other-summary.content') }}
	</div>
	<div class="text project-label">{{ t('components.config-preload.label') }}</div>
	<SelectBox
		id="config-preload"
		:ref="controlRef('config-preload')"
		v-tip="t('components.config-preload.tip')"
		v-model="form.preload"
	/>
	<div class="text project-label">{{ t('components.config-deadzone.label') }}</div>
	<NumberBox
		id="config-deadzone"
		:ref="controlRef('config-deadzone')"
		v-tip="t('components.config-deadzone.tip')"
		v-model="form.deadzone"
		min="0"
		max="1"
		step="0.01"
		decimals="4"
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
import NumberBox from '@app/components/common/NumberBox.vue';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'config-deadzone' | 'config-preload';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();
const { form } = useProjectSettingsWindow();

onMounted(() => registerProjectSettingsControls(controls));
onUnmounted(() => resetProjectSettingsControls(controls));
</script>
