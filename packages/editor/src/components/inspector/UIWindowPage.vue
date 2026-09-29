<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiWindow-properties-grid.label') || 'Window Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiWindow-properties-grid">
			<UIWindowLayoutSection />
			<UIWindowOverflowSection />
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryElements } from '@app/utils/element-registry';
import '@app/inspector/element-window-page.ts';
import { useUIWindowPage } from '@app/composables/useUIWindowPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import { uiWindowContextKey } from './ui-window/context.ts';
import UIWindowLayoutSection from './ui-window/UIWindowLayoutSection.vue';
import UIWindowOverflowSection from './ui-window/UIWindowOverflowSection.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useUIWindowPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(uiWindowContextKey, { form, onParamInput });

const { bindInput } = useInspectorInput();

onMounted(() => {
	const uiWindow = Inspector.uiWindow;
	if (!uiWindow) return;
	const elements = registryElements(inspectorEls, [
		'uiWindow-layout',
		'uiWindow-scrollX',
		'uiWindow-scrollY',
		'uiWindow-gridWidth',
		'uiWindow-gridHeight',
		'uiWindow-gridGapX',
		'uiWindow-gridGapY',
		'uiWindow-paddingX',
		'uiWindow-paddingY',
		'uiWindow-overflow'
	]);
	bindInput(elements, getUIStore(), uiWindow);

	const el = inspectorEls.get('uiWindow-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	sync();
});
</script>
