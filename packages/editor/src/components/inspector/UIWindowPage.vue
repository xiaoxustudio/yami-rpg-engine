<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiWindow-properties-grid.label') || 'Window Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiWindow-properties-grid">
			<div class="text">{{ t('components.uiWindow-layout.label') || 'Layout' }}</div>
			<SelectBox id="uiWindow-layout" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiWindow-scrollX.label') || 'Scroll X' }}</div>
			<NumberBox
				id="uiWindow-scrollX"
				min="0"
				max="10000"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiWindow-scrollY.label') || 'Scroll Y' }}</div>
			<NumberBox
				id="uiWindow-scrollY"
				min="0"
				max="10000"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiWindow-gridWidth.label') || 'Grid Width' }}</div>
			<NumberBox
				id="uiWindow-gridWidth"
				min="0"
				max="1000"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiWindow-gridHeight.label') || 'Grid Height' }}</div>
			<NumberBox
				id="uiWindow-gridHeight"
				min="0"
				max="1000"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiWindow-gridGapX.label') || 'Grid Gap X' }}</div>
			<NumberBox
				id="uiWindow-gridGapX"
				min="0"
				max="1000"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiWindow-gridGapY.label') || 'Grid Gap Y' }}</div>
			<NumberBox
				id="uiWindow-gridGapY"
				min="0"
				max="1000"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiWindow-paddingX.label') || 'Padding X' }}</div>
			<NumberBox
				id="uiWindow-paddingX"
				min="0"
				max="1000"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiWindow-paddingY.label') || 'Padding Y' }}</div>
			<NumberBox
				id="uiWindow-paddingY"
				min="0"
				max="1000"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiWindow-overflow.label') || 'Overflow' }}</div>
			<SelectBox id="uiWindow-overflow" @input="onParamInput"></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import '@app/inspector/element-window-page.ts';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { UI } from '@app/ui/ui-window.ts';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const onParamInput = (event: Event) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.uiElement?.paramInput?.({ target });
};

const { t } = useI18n();

const { bindInput } = useInspectorInput();

const loadItems = (id: string, items: { name: string; value: string }[]) => {
	const el = document.getElementById(id) as unknown as {
		loadItems?: (items: { name: string; value: string }[]) => void;
	} | null;
	el?.loadItems?.(items);
};

const relate = (
	id: string,
	config: { case: string | string[]; targets: (HTMLElement | null)[] }[]
) => {
	const el = document.getElementById(id) as unknown as {
		enableHiddenMode?: () => {
			relate: (
				config: { case: string | string[]; targets: (HTMLElement | null)[] }[]
			) => void;
		};
	} | null;
	if (el) el.enableHiddenMode()?.relate(config);
};

onMounted(() => {
	const uiWindow = Inspector.uiWindow;
	if (!uiWindow) return;

	loadItems('uiWindow-layout', [
		{ name: 'Normal', value: 'normal' },
		{ name: 'Horizontal Grid', value: 'horizontal-grid' },
		{ name: 'Vertical Grid', value: 'vertical-grid' }
	]);
	relate('uiWindow-layout', [
		{
			case: 'normal',
			targets: [
				document.getElementById('uiWindow-scrollX'),
				document.getElementById('uiWindow-scrollY')
			]
		},
		{
			case: ['horizontal-grid', 'vertical-grid'],
			targets: [
				document.getElementById('uiWindow-scrollX'),
				document.getElementById('uiWindow-scrollY'),
				document.getElementById('uiWindow-gridWidth'),
				document.getElementById('uiWindow-gridHeight'),
				document.getElementById('uiWindow-gridGapX'),
				document.getElementById('uiWindow-gridGapY'),
				document.getElementById('uiWindow-paddingX'),
				document.getElementById('uiWindow-paddingY')
			]
		}
	]);
	loadItems('uiWindow-overflow', [
		{ name: 'Visible', value: 'visible' },
		{ name: 'Hidden', value: 'hidden' }
	]);

	const elements = document.querySelectorAll(`#uiWindow-layout,
    #uiWindow-scrollX, #uiWindow-scrollY, #uiWindow-gridWidth,
    #uiWindow-gridHeight, #uiWindow-gridGapX, #uiWindow-gridGapY,
    #uiWindow-paddingX, #uiWindow-paddingY, #uiWindow-overflow`);
	bindInput(elements, uiWindow, UI);
});
</script>
