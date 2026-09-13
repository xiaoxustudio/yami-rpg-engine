<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileUI-foreground-grid.label') || 'Stage Foreground'
		}}</DetailSummary>
		<div class="detail-grid" id="fileUI-foreground-grid">
			<div class="text">{{ t('components.fileUI-width.label') || 'Width' }}</div>
			<NumberBox
				id="fileUI-width"
				v-tip="t('components.fileUI-width.tip')"
				ref="elWidth"
				v-model="form.width"
				min="8"
				max="7680"
				unit="px"
				@input="onParamInput"
			/>
			<div class="text">{{ t('components.fileUI-height.label') || 'Height' }}</div>
			<NumberBox
				id="fileUI-height"
				v-tip="t('components.fileUI-height.tip')"
				ref="elHeight"
				v-model="form.height"
				min="8"
				max="7680"
				unit="px"
				@input="onParamInput"
			/>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement } from '@app/utils/element-registry';
import '@app/inspector/file-ui-page.ts';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFileUIPage } from '@app/composables/useFileUIPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput } = useFileUIPage();

const { bindInput } = useInspectorInput();

const elWidth = ref<InstanceType<typeof NumberBox> | null>(null);
const elHeight = ref<InstanceType<typeof NumberBox> | null>(null);

onMounted(() => {
	const editor = Inspector.fileUI;
	if (!editor) return;

	const el = inspectorEls.get('fileUI-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	const elements = [elWidth.value?.root, elHeight.value?.root].filter(
		(el): el is HTMLElement => el != null
	);
	// P1b：file-ui-page.ts 的焦点/失焦批量绑定按 id 列表读注册表 → 这里登记
	if (elWidth.value?.root) registerElement(inspectorEls, 'fileUI-width', elWidth.value.root);
	if (elHeight.value?.root) registerElement(inspectorEls, 'fileUI-height', elHeight.value.root);
	bindInput(elements, editor, editor.owner as { history: unknown });

	sync();
});
</script>
