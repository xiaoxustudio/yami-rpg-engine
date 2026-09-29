<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiButton-sound-effects-grid.label') || 'Sound Effects'
		}}</DetailSummary>
		<div class="detail-grid" id="uiButton-sound-effects-grid">
			<div class="text">{{ t('components.uiButton-hoverSound.label') || 'Hover SE' }}</div>
			<CustomBox
				id="uiButton-hoverSound"
				:ref="registryRef(inspectorEls, 'uiButton-hoverSound')"
				v-tip="t('components.uiButton-hoverSound.tip')"
				:model-value="form.hoverSound"
				@input="onParamInput"
				type="file"
				filter="audio"
			></CustomBox>
			<div class="text">{{ t('components.uiButton-clickSound.label') || 'Click SE' }}</div>
			<CustomBox
				id="uiButton-clickSound"
				:ref="registryRef(inspectorEls, 'uiButton-clickSound')"
				v-tip="t('components.uiButton-clickSound.tip')"
				:model-value="form.clickSound"
				@input="onParamInput"
				type="file"
				filter="audio"
			></CustomBox>
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
import CustomBox from '@app/components/common/CustomBox.vue';
import { uiButtonContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(uiButtonContextKey)!;
</script>
