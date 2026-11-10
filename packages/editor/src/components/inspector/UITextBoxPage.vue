<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiTextBox-properties-grid.label') || 'TextBox Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiTextBox-properties-grid">
			<UITextBoxInputSection />
			<UITextBoxStyleSection />
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, provide, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { uiTextBoxPageNodes } from '@app/composables/inspector-page-nodes';
import { useUITextBoxPage } from '@app/composables/useUITextBoxPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { inspectorPageSync, type PageSyncApi } from '@app/composables/inspector-page-sync';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import { uiTextBoxContextKey } from './ui-text-box/context.ts';
import UITextBoxInputSection from './ui-text-box/UITextBoxInputSection.vue';
import UITextBoxStyleSection from './ui-text-box/UITextBoxStyleSection.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useUITextBoxPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(uiTextBoxContextKey, { form, onParamInput });

const { bindInput } = useInspectorInput();

onMounted(() => {
	const uiTextBox = Inspector.uiTextBox;
	if (!uiTextBox) return;
	const elements = [
		uiTextBoxPageNodes.pick('type'),
		uiTextBoxPageNodes.pick('align'),
		uiTextBoxPageNodes.pick('text'),
		uiTextBoxPageNodes.pick('maxLength'),
		uiTextBoxPageNodes.pick('number'),
		uiTextBoxPageNodes.pick('min'),
		uiTextBoxPageNodes.pick('max'),
		uiTextBoxPageNodes.pick('decimals'),
		uiTextBoxPageNodes.pick('padding'),
		uiTextBoxPageNodes.pick('size'),
		uiTextBoxPageNodes.pick('font'),
		uiTextBoxPageNodes.pick('color'),
		uiTextBoxPageNodes.pick('selectionColor'),
		uiTextBoxPageNodes.pick('selectionBgColor')
	].filter((el): el is HTMLElement => el != null);
	bindInput(elements, getUIStore(), uiTextBox);

	const bridgeApi: PageSyncApi = { sync };
	inspectorPageSync.uiTextBox.provide(bridgeApi);
	onUnmounted(() => inspectorPageSync.uiTextBox.reset(bridgeApi));
	sync();
});
</script>
