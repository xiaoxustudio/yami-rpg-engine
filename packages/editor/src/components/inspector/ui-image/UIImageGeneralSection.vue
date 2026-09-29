<template>
	<DetailBox
		id="uiElement-general-group"
		:ref="registryRef(inspectorEls, 'uiElement-general-group')"
		open
	>
		<DetailSummary>{{
			t('components.uiElement-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="uiElement-general-grid">
			<div class="text">{{ t('components.uiElement-name.label') || 'Name' }}</div>
			<TextBox
				id="uiElement-name"
				v-tip="t('components.uiElement-name.tip')"
				:ref="registryRef(inspectorEls, 'uiElement-name')"
				v-model="form.name"
				@input="onParamInput"
			></TextBox>
			<div class="text">
				{{ t('components.uiElement-pointerEvents.label') || 'Pointer Events' }}
			</div>
			<SelectBox
				id="uiElement-pointerEvents"
				v-tip="t('components.uiElement-pointerEvents.tip')"
				:ref="registryRef(inspectorEls, 'uiElement-pointerEvents')"
				v-model="form.pointerEvents"
				@input="onParamInput"
			></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryRef } from '@app/utils/element-registry';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import { uiImageContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(uiImageContextKey)!;
</script>
