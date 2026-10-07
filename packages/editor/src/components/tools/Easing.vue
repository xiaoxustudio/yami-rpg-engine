<template>
	<WindowFrame id="easing" :ref="registryRef(dataEls, 'easing')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.easing.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="field-set input pad" id="easing-list-fieldset">
			<div class="legend">{{ t('components.easing-list.label') }}</div>
			<TreeList
				id="easing-list"
				:ref="registryRef(dataEls, 'easing-list')"
				padded
				:node-extras="nodeExtras"
				:node-icon-renderer="nodeIconRenderer"
				@select="onListSelect"
				@open="onListOpen"
				@popup="onListPopup"
				@change="onListChange"
			/>
		</div>
		<EasingPointsSection />
		<div class="field-set" id="easing-curve-fieldset">
			<div class="legend">{{ t('components.easing-curve-canvas.label') }}</div>
			<canvas
				id="easing-curve-canvas"
				:ref="registryRef(dataEls, 'easing-curve-canvas')"
				width="0"
				height="0"
				tabindex="-1"
			/>
			<RadioBox name="easing-scale" value="1">100%</RadioBox>
			<RadioBox name="easing-scale" value="0.5">50%</RadioBox>
		</div>
		<div class="field-set" id="easing-preview-fieldset">
			<div class="legend">{{ t('components.easing-preview-canvas.label') }}</div>
			<canvas
				id="easing-preview-canvas"
				:ref="registryRef(dataEls, 'easing-preview-canvas')"
				width="0"
				height="0"
			/>
			<div class="grid-box" id="easing-preview-grid">
				<div class="text">{{ t('components.easing-preview-reverse.label') }}</div>
				<SelectBox
					:label="t('components.easing-preview-reverse.label')"
					id="easing-preview-reverse"
					v-tip="t('components.easing-preview-reverse.tip')"
					:ref="registryRef(dataEls, 'easing-preview-reverse')"
					v-model="form.preview.reverse"
				/>
				<div class="text">{{ t('components.easing-preview-duration.label') }}</div>
				<NumberBox
					:label="t('components.easing-preview-duration.label')"
					id="easing-preview-duration"
					v-tip="t('components.easing-preview-duration.tip')"
					min="1"
					max="60000"
					unit="ms"
					v-model="form.preview.duration"
					@change="onDurationInput"
				/>
				<div class="text">{{ t('components.easing-preview-delay.label') }}</div>
				<NumberBox
					:label="t('components.easing-preview-delay.label')"
					id="easing-preview-delay"
					v-tip="t('components.easing-preview-delay.tip')"
					min="0"
					max="5000"
					unit="ms"
					v-model="form.preview.delay"
					@change="onDelayInput"
				/>
			</div>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, type VNode } from 'vue';
import type { YamiEvent } from '@app/types/editor-event';
import { dataEls } from '@app/data/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { Easing } from '@app/data/transition-window.ts';
import { useEasingWindow } from '@app/composables/useEasingWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import TreeList from '@app/components/common/TreeList.vue';
import EasingPointsSection from './easing/EasingPointsSection.vue';

const onConfirm = () => {
	Easing?.confirm?.(new Event('click'));
};

const { t } = useI18n();

const easingWindow = useEasingWindow();
const form = easingWindow.form;

const onDurationInput = () => {
	Easing?.durationInput?.();
};

const onDelayInput = () => {
	Easing?.delayInput?.();
};

const onListSelect = (event: YamiEvent) => {
	Easing?.listSelect?.(event as never);
};
const onListOpen = (event: YamiEvent) => {
	Easing?.listOpen?.(event as never);
};
const onListPopup = (event: YamiEvent) => {
	Easing?.listPopup?.(event as never);
};
const onListChange = (event: Event & { value?: unknown }) => {
	Easing?.dataChange?.(event);
};

const nodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as { key?: string };
	(container.parentNode as HTMLElement | null)?.classList.add('plain');
	return [h('div', { class: 'variable-init-text text' }, ' = ' + node.key)];
};

const nodeIconRenderer = (item: unknown): VNode[] => {
	const node = item as { class?: string };
	if (node.class === 'folder') {
		return [h('span', { class: ['node-icon', 'icon-folder'] })];
	}
	return [h('span', { class: ['node-icon', ['icon-command', 'flow']] })];
};

onMounted(() => {});
</script>
<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#easing {
	width: 800px;
	height: 604px;
}

#easing-list-fieldset {
	left: 10px;
	top: 10px;
	width: 200px;
	height: 234px;
}

#easing-list {
	font-family: var(--font-family-mono);
}

#easing-points-fieldset {
	left: 220px;
	top: 10px;
	width: 326px;
	height: 234px;
}

#easing-points-grid {
	grid-template-columns: 100px 98px 98px;
}

#easing-mode {
	grid-column-start: 2;
	grid-column-end: 4;
	grid-row-start: 1;
}

#easing-points-0-x,
#easing-points-0-y,
#easing-points-1-x,
#easing-points-1-y,
#easing-points-2-x,
#easing-points-2-y,
#easing-points-3-x,
#easing-points-3-y,
#easing-points-4-x,
#easing-points-4-y,
#easing-points-5-x,
#easing-points-5-y,
#easing-points-6-x,
#easing-points-6-y,
#easing-points-7-x,
#easing-points-7-y {
	width: 98px;
}

#easing-curve-fieldset {
	padding: 10px;
	left: 556px;
	top: 10px;
	width: 234px;
	height: 234px;
}

#easing-curve-canvas {
	position: absolute;
	left: 1px;
	top: 1px;
	width: calc(100% - 2px);
	height: calc(100% - 2px);
	/* background-color: green; */
}

#easing-preview-fieldset {
	left: 10px;
	top: 254px;
	width: 780px;
	height: 282px;
}

#easing-preview-canvas {
	position: absolute;
	left: 1px;
	top: 1px;
	width: calc(100% - 2px);
	height: calc(100% - 2px);
	/* background-color: green; */
}

#easing-preview-grid {
	position: absolute;
	left: auto;
	right: 0;
	grid-template-columns: 60px 1fr;
}

#easing-preview-reverse,
#easing-preview-duration,
#easing-preview-delay {
	width: 80px;
}

#easing-confirm {
	right: 108px;
	bottom: 10px;
}

#easing-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
