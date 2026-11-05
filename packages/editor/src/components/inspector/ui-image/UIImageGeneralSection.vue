<template>
	<DetailBox id="uiElement-general-group" :ref="bind('uiElement-general-group')" open>
		<DetailSummary>{{
			t('components.uiElement-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="uiElement-general-grid">
			<div class="text">{{ t('components.uiElement-name.label') || 'Name' }}</div>
			<TextBox
				:label="t('components.uiElement-name.label') || 'Name'"
				id="uiElement-name"
				v-tip="t('components.uiElement-name.tip')"
				:ref="bind('uiElement-name')"
				v-model="form.name"
				@input="onParamInput"
			></TextBox>
			<div class="text">
				{{ t('components.uiElement-pointerEvents.label') || 'Pointer Events' }}
			</div>
			<SelectBox
				:label="t('components.uiElement-pointerEvents.label') || 'Pointer Events'"
				id="uiElement-pointerEvents"
				v-tip="t('components.uiElement-pointerEvents.tip')"
				:ref="bind('uiElement-pointerEvents')"
				v-model="form.pointerEvents"
				@input="onParamInput"
			></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import {
	UI_ELEMENT_CONTROLS_KEY,
	createControlBinder,
	type UiElementControlTable
} from '@app/composables/ui-element-page-controls';
import { useI18n } from 'vue-i18n';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import { uiImageContextKey } from './context.ts';

/** section 往页面那张表里填自己那一半。 */
const controls = inject<UiElementControlTable>(UI_ELEMENT_CONTROLS_KEY, {});
const bind = createControlBinder(controls);

const { t } = useI18n();
const { form, onParamInput } = inject(uiImageContextKey)!;
</script>
