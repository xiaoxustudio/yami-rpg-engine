<template>
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
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { composableEls } from '@app/composables/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useProjectSettingsWindow } from '@app/composables/useProjectSettingsWindow';
import SelectBox from '@app/components/common/SelectBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const { t } = useI18n();
const { form } = useProjectSettingsWindow();
</script>
