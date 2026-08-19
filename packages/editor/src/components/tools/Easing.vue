<template>
	<WindowFrame id="easing">
		<template #title><TitleBar>{{ t('components.easing.title') }}<div class="close" /></TitleBar></template>
		
			<div class="field-set input pad" id="easing-list-fieldset">
				<div class="legend">{{ t('components.easing-list.label') }}</div>
				<TreeList
					id="easing-list"
					padded
					:node-extras="nodeExtras"
					:node-icon-renderer="nodeIconRenderer"
					@select="onListSelect"
					@open="onListOpen"
					@popup="onListPopup"
					@change="onListChange"
				/>
			</div>
			<div class="field-set" id="easing-points-fieldset">
				<div class="legend">{{ t('components.easing-points-grid.label') }}</div>
				<div class="grid-box" id="easing-points-grid">
					<div class="text">{{ t('components.easing-mode.label') }}</div><SelectBox id="easing-mode" />
					<div class="text" id="easing-points-0">{{ t('components.easing-points-0.content') }}</div>
					<NumberBox id="easing-points-0-x" min="0" max="1" step="0.01" decimals="2"
						><div class="text label">X</div></NumberBox
					>
					<NumberBox id="easing-points-0-y" min="-5" max="5" step="0.01" decimals="2"
						><div class="text label">Y</div></NumberBox
					>
					<div class="text" id="easing-points-1">{{ t('components.easing-points-1.content') }}</div>
					<NumberBox id="easing-points-1-x" min="0" max="1" step="0.01" decimals="2"
						><div class="text label">X</div></NumberBox
					>
					<NumberBox id="easing-points-1-y" min="-5" max="5" step="0.01" decimals="2"
						><div class="text label">Y</div></NumberBox
					>
					<div class="text" id="easing-points-2">{{ t('components.easing-points-2.content') }}</div>
					<NumberBox id="easing-points-2-x" min="0" max="1" step="0.01" decimals="2"
						><div class="text label">X</div></NumberBox
					>
					<NumberBox id="easing-points-2-y" min="-5" max="5" step="0.01" decimals="2"
						><div class="text label">Y</div></NumberBox
					>
					<div class="text" id="easing-points-3">{{ t('components.easing-points-3.content') }}</div>
					<NumberBox id="easing-points-3-x" min="0" max="1" step="0.01" decimals="2"
						><div class="text label">X</div></NumberBox
					>
					<NumberBox id="easing-points-3-y" min="-5" max="5" step="0.01" decimals="2"
						><div class="text label">Y</div></NumberBox
					>
					<div class="text" id="easing-points-4">{{ t('components.easing-points-4.content') }}</div>
					<NumberBox id="easing-points-4-x" min="0" max="1" step="0.01" decimals="2"
						><div class="text label">X</div></NumberBox
					>
					<NumberBox id="easing-points-4-y" min="-5" max="5" step="0.01" decimals="2"
						><div class="text label">Y</div></NumberBox
					>
					<div class="text" id="easing-points-5">{{ t('components.easing-points-5.content') }}</div>
					<NumberBox id="easing-points-5-x" min="0" max="1" step="0.01" decimals="2"
						><div class="text label">X</div></NumberBox
					>
					<NumberBox id="easing-points-5-y" min="-5" max="5" step="0.01" decimals="2"
						><div class="text label">Y</div></NumberBox
					>
					<div class="text" id="easing-points-6">{{ t('components.easing-points-6.content') }}</div>
					<NumberBox id="easing-points-6-x" min="0" max="1" step="0.01" decimals="2"
						><div class="text label">X</div></NumberBox
					>
					<NumberBox id="easing-points-6-y" min="-5" max="5" step="0.01" decimals="2"
						><div class="text label">Y</div></NumberBox
					>
					<div class="text" id="easing-points-7">{{ t('components.easing-points-7.content') }}</div>
					<NumberBox id="easing-points-7-x" min="0" max="1" step="0.01" decimals="2"
						><div class="text label">X</div></NumberBox
					>
					<NumberBox id="easing-points-7-y" min="-5" max="5" step="0.01" decimals="2"
						><div class="text label">Y</div></NumberBox
					>
				</div>
			</div>
			<div class="field-set" id="easing-curve-fieldset">
				<div class="legend">{{ t('components.easing-curve-canvas.label') }}</div>
				<canvas id="easing-curve-canvas" width="0" height="0" tabindex="-1" />
				<RadioBox name="easing-scale" value="1">100%</RadioBox>
				<RadioBox name="easing-scale" value="0.5">50%</RadioBox>
			</div>
			<div class="field-set" id="easing-preview-fieldset">
				<div class="legend">{{ t('components.easing-preview-canvas.label') }}</div>
				<canvas id="easing-preview-canvas" width="0" height="0" />
				<div class="grid-box" id="easing-preview-grid">
					<div class="text">{{ t('components.easing-preview-reverse.label') }}</div><SelectBox id="easing-preview-reverse" />
					<div class="text">{{ t('components.easing-preview-duration.label') }}</div
					><NumberBox
						id="easing-preview-duration"
						min="1"
						max="60000"
						unit="ms"
					/>
					<div class="text">{{ t('components.easing-preview-delay.label') }}</div
					><NumberBox id="easing-preview-delay" min="0" max="5000" unit="ms" />
				</div>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, type VNode } from 'vue';
import { useI18n } from 'vue-i18n';
import { Easing } from '@app/legacy/data/transition-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberBox from '@app/components/common/NumberBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const onListSelect = (event: Event & { value?: unknown }) => {
	Easing?.listSelect?.(event);
};
const onListOpen = (event: Event & { value?: unknown }) => {
	Easing?.listOpen?.(event);
};
const onListPopup = (event: PointerEvent & { value?: unknown }) => {
	Easing?.listPopup?.(event);
};
const onListChange = (event: Event & { value?: unknown }) => {
	Easing?.dataChange?.(event);
};

const nodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as { key?: string };
	container.parentNode?.classList.add('plain');
	return [h('div', { class: 'variable-init-text text' }, ' = ' + node.key)];
};

const nodeIconRenderer = (item: unknown): VNode[] => {
	const node = item as { class?: string };
	if (node.class === 'folder') {
		return [h('node-icon', { class: 'icon-folder' })];
	}
	return [h('node-icon', { class: ['icon-command', 'flow'] })];
};

const local = useLocalStore();

onMounted(() => {
});
</script>
