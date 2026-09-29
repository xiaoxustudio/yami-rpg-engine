<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.particleLayer-rendering-grid.label') || 'Rendering'
		}}</DetailSummary>
		<div class="detail-grid" id="particleLayer-rendering-grid">
			<ParticleLayerRenderSection />
			<ParticleLayerColorSection />
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ParticleLayerRenderSection from './ParticleLayerRenderSection.vue';
import ParticleLayerColorSection from './ParticleLayerColorSection.vue';

const { t } = useI18n();
</script>
