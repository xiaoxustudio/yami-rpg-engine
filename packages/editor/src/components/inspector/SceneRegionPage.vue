<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneRegion-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="sceneRegion-general-grid">
			<SceneRegionPropertiesSection />
		</div>
	</DetailBox>
	<SceneRegionMetaSection />
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { useSceneRegionPage } from '@app/composables/useSceneRegionPage';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import { sceneRegionContextKey } from './scene-region/context.ts';
import SceneRegionPropertiesSection from './scene-region/SceneRegionPropertiesSection.vue';
import SceneRegionMetaSection from './scene-region/SceneRegionMetaSection.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useSceneRegionPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(sceneRegionContextKey, { form, onParamInput });

onMounted(() => {
	const editor = Inspector.sceneRegion;
	if (!editor) return;
	const el = inspectorEls.get('sceneRegion-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
