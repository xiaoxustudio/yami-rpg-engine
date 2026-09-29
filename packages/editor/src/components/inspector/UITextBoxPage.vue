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
import { onMounted, provide } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryElements } from '@app/utils/element-registry';
import { useUITextBoxPage } from '@app/composables/useUITextBoxPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { attachElementApi } from '@app/utils/attach-element-api';
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
	const elements = registryElements(inspectorEls, [
		'uiTextBox-type',
		'uiTextBox-align',
		'uiTextBox-text',
		'uiTextBox-maxLength',
		'uiTextBox-number',
		'uiTextBox-min',
		'uiTextBox-max',
		'uiTextBox-decimals',
		'uiTextBox-padding',
		'uiTextBox-size',
		'uiTextBox-font',
		'uiTextBox-color',
		'uiTextBox-selectionColor',
		'uiTextBox-selectionBgColor'
	]);
	bindInput(elements, getUIStore(), uiTextBox);

	const el = inspectorEls.get('uiTextBox-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
