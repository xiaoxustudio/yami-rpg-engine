<template>
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
		:ref="registryRef(composableEls, 'config-collision-trigger-collideWithActorShape')"
		v-tip="t('components.config-collision-trigger-collideWithActorShape.tip')"
		v-model="form.collision.trigger.collideWithActorShape"
	/>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { composableEls } from '@app/composables/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useProjectSettingsWindow } from '@app/composables/useProjectSettingsWindow';
import NumberBox from '@app/components/common/NumberBox.vue';
import KeyboardBox from '@app/components/common/KeyboardBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();
const { form } = useProjectSettingsWindow();
</script>
