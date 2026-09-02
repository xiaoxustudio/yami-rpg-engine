<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiWindow-properties-grid.label') || 'Window Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiWindow-properties-grid">
			<div class="text">{{ t('components.uiWindow-layout.label') || 'Layout' }}</div>
			<SelectBox
				ref="elLayout"
				id="uiWindow-layout"
				v-model="form.layout"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiWindow-scrollX.label') || 'Scroll X' }}</div>
			<NumberBox
				ref="elScrollX"
				id="uiWindow-scrollX"
				v-model="form.scrollX"
				min="0"
				max="10000"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiWindow-scrollY.label') || 'Scroll Y' }}</div>
			<NumberBox
				ref="elScrollY"
				id="uiWindow-scrollY"
				v-model="form.scrollY"
				min="0"
				max="10000"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiWindow-gridWidth.label') || 'Grid Width' }}</div>
			<NumberBox
				ref="elGridWidth"
				id="uiWindow-gridWidth"
				v-model="form.gridWidth"
				min="0"
				max="1000"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiWindow-gridHeight.label') || 'Grid Height' }}</div>
			<NumberBox
				ref="elGridHeight"
				id="uiWindow-gridHeight"
				v-model="form.gridHeight"
				min="0"
				max="1000"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiWindow-gridGapX.label') || 'Grid Gap X' }}</div>
			<NumberBox
				ref="elGridGapX"
				id="uiWindow-gridGapX"
				v-model="form.gridGapX"
				min="0"
				max="1000"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiWindow-gridGapY.label') || 'Grid Gap Y' }}</div>
			<NumberBox
				ref="elGridGapY"
				id="uiWindow-gridGapY"
				v-model="form.gridGapY"
				min="0"
				max="1000"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiWindow-paddingX.label') || 'Padding X' }}</div>
			<NumberBox
				ref="elPaddingX"
				id="uiWindow-paddingX"
				v-model="form.paddingX"
				min="0"
				max="1000"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiWindow-paddingY.label') || 'Padding Y' }}</div>
			<NumberBox
				ref="elPaddingY"
				id="uiWindow-paddingY"
				v-model="form.paddingY"
				min="0"
				max="1000"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiWindow-overflow.label') || 'Overflow' }}</div>
			<SelectBox
				ref="elOverflow"
				id="uiWindow-overflow"
				v-model="form.overflow"
				@input="onParamInput"
			></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import '@app/inspector/element-window-page.ts';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUIWindowPage } from '@app/composables/useUIWindowPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { UI } from '@app/ui/ui-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useUIWindowPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const { bindInput } = useInspectorInput();

const elLayout = ref<InstanceType<typeof SelectBox> | null>(null);
const elOverflow = ref<InstanceType<typeof SelectBox> | null>(null);
const elScrollX = ref<InstanceType<typeof NumberBox> | null>(null);
const elScrollY = ref<InstanceType<typeof NumberBox> | null>(null);
const elGridWidth = ref<InstanceType<typeof NumberBox> | null>(null);
const elGridHeight = ref<InstanceType<typeof NumberBox> | null>(null);
const elGridGapX = ref<InstanceType<typeof NumberBox> | null>(null);
const elGridGapY = ref<InstanceType<typeof NumberBox> | null>(null);
const elPaddingX = ref<InstanceType<typeof NumberBox> | null>(null);
const elPaddingY = ref<InstanceType<typeof NumberBox> | null>(null);

onMounted(() => {
	const uiWindow = Inspector.uiWindow;
	if (!uiWindow) return;

	elLayout.value?.loadItems([
		{ name: 'Normal', value: 'normal' },
		{ name: 'Horizontal Grid', value: 'horizontal-grid' },
		{ name: 'Vertical Grid', value: 'vertical-grid' }
	]);
	elLayout.value?.enableHiddenMode();
	elLayout.value?.relate([
		{
			case: 'normal',
			targets: [elScrollX.value?.root ?? null, elScrollY.value?.root ?? null]
		},
		{
			case: ['horizontal-grid', 'vertical-grid'],
			targets: [
				elScrollX.value?.root ?? null,
				elScrollY.value?.root ?? null,
				elGridWidth.value?.root ?? null,
				elGridHeight.value?.root ?? null,
				elGridGapX.value?.root ?? null,
				elGridGapY.value?.root ?? null,
				elPaddingX.value?.root ?? null,
				elPaddingY.value?.root ?? null
			]
		}
	]);
	elOverflow.value?.loadItems([
		{ name: 'Visible', value: 'visible' },
		{ name: 'Hidden', value: 'hidden' }
	]);

	const elements = document.querySelectorAll(`#uiWindow-layout,
    #uiWindow-scrollX, #uiWindow-scrollY, #uiWindow-gridWidth,
    #uiWindow-gridHeight, #uiWindow-gridGapX, #uiWindow-gridGapY,
    #uiWindow-paddingX, #uiWindow-paddingY, #uiWindow-overflow`);
	bindInput(elements, uiWindow, UI);

	const el = document.getElementById('uiWindow-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
