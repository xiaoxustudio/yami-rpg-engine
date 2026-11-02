<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiButton-sound-effects-grid.label') || 'Sound Effects'
		}}</DetailSummary>
		<div class="detail-grid" id="uiButton-sound-effects-grid">
			<div class="text">{{ t('components.uiButton-hoverSound.label') || 'Hover SE' }}</div>
			<CustomBox
				id="uiButton-hoverSound"
				:ref="controlRef('uiButton-hoverSound')"
				v-tip="t('components.uiButton-hoverSound.tip')"
				:model-value="form.hoverSound"
				@input="onParamInput"
				type="file"
				filter="audio"
			></CustomBox>
			<div class="text">{{ t('components.uiButton-clickSound.label') || 'Click SE' }}</div>
			<CustomBox
				id="uiButton-clickSound"
				:ref="controlRef('uiButton-clickSound')"
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
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import { uiButtonContextKey } from './context.ts';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'uiButton-clickSound' | 'uiButton-hoverSound';

const { controlRef } = useControlRefs<Id>();

const { t } = useI18n();
const { form, onParamInput } = inject(uiButtonContextKey)!;
</script>
