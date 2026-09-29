<template>
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
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { composableEls } from '@app/composables/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useProjectSettingsWindow } from '@app/composables/useProjectSettingsWindow';
import ParamList from '@app/components/common/ParamList.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const { t } = useI18n();
const { form } = useProjectSettingsWindow();
</script>
