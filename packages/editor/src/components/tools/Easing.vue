<template>
	<WindowFrame id="easing">
		<template #title
			><TitleBar
				>{{ t('components.easing.title') }}
				<div class="close" /></TitleBar
		></template>

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
				<div class="text">{{ t('components.easing-mode.label') }}</div>
				<SelectBox id="easing-mode" v-model="form.mode" />
				<div class="text" id="easing-points-0">
					{{ t('components.easing-points-0.content') }}
				</div>
				<NumberBox
					id="easing-points-0-x"
					min="0"
					max="1"
					step="0.01"
					decimals="2"
					v-model="form.points[0].x"
					><div class="text label">X</div></NumberBox
				>
				<NumberBox
					id="easing-points-0-y"
					min="-5"
					max="5"
					step="0.01"
					decimals="2"
					v-model="form.points[0].y"
					><div class="text label">Y</div></NumberBox
				>
				<div class="text" id="easing-points-1">
					{{ t('components.easing-points-1.content') }}
				</div>
				<NumberBox
					id="easing-points-1-x"
					min="0"
					max="1"
					step="0.01"
					decimals="2"
					v-model="form.points[1].x"
					><div class="text label">X</div></NumberBox
				>
				<NumberBox
					id="easing-points-1-y"
					min="-5"
					max="5"
					step="0.01"
					decimals="2"
					v-model="form.points[1].y"
					><div class="text label">Y</div></NumberBox
				>
				<div class="text" id="easing-points-2">
					{{ t('components.easing-points-2.content') }}
				</div>
				<NumberBox
					id="easing-points-2-x"
					min="0"
					max="1"
					step="0.01"
					decimals="2"
					v-model="form.points[2].x"
					><div class="text label">X</div></NumberBox
				>
				<NumberBox
					id="easing-points-2-y"
					min="-5"
					max="5"
					step="0.01"
					decimals="2"
					v-model="form.points[2].y"
					><div class="text label">Y</div></NumberBox
				>
				<div class="text" id="easing-points-3">
					{{ t('components.easing-points-3.content') }}
				</div>
				<NumberBox
					id="easing-points-3-x"
					min="0"
					max="1"
					step="0.01"
					decimals="2"
					v-model="form.points[3].x"
					><div class="text label">X</div></NumberBox
				>
				<NumberBox
					id="easing-points-3-y"
					min="-5"
					max="5"
					step="0.01"
					decimals="2"
					v-model="form.points[3].y"
					><div class="text label">Y</div></NumberBox
				>
				<div class="text" id="easing-points-4">
					{{ t('components.easing-points-4.content') }}
				</div>
				<NumberBox
					id="easing-points-4-x"
					min="0"
					max="1"
					step="0.01"
					decimals="2"
					v-model="form.points[4].x"
					><div class="text label">X</div></NumberBox
				>
				<NumberBox
					id="easing-points-4-y"
					min="-5"
					max="5"
					step="0.01"
					decimals="2"
					v-model="form.points[4].y"
					><div class="text label">Y</div></NumberBox
				>
				<div class="text" id="easing-points-5">
					{{ t('components.easing-points-5.content') }}
				</div>
				<NumberBox
					id="easing-points-5-x"
					min="0"
					max="1"
					step="0.01"
					decimals="2"
					v-model="form.points[5].x"
					><div class="text label">X</div></NumberBox
				>
				<NumberBox
					id="easing-points-5-y"
					min="-5"
					max="5"
					step="0.01"
					decimals="2"
					v-model="form.points[5].y"
					><div class="text label">Y</div></NumberBox
				>
				<div class="text" id="easing-points-6">
					{{ t('components.easing-points-6.content') }}
				</div>
				<NumberBox
					id="easing-points-6-x"
					min="0"
					max="1"
					step="0.01"
					decimals="2"
					v-model="form.points[6].x"
					><div class="text label">X</div></NumberBox
				>
				<NumberBox
					id="easing-points-6-y"
					min="-5"
					max="5"
					step="0.01"
					decimals="2"
					v-model="form.points[6].y"
					><div class="text label">Y</div></NumberBox
				>
				<div class="text" id="easing-points-7">
					{{ t('components.easing-points-7.content') }}
				</div>
				<NumberBox
					id="easing-points-7-x"
					min="0"
					max="1"
					step="0.01"
					decimals="2"
					v-model="form.points[7].x"
					><div class="text label">X</div></NumberBox
				>
				<NumberBox
					id="easing-points-7-y"
					min="-5"
					max="5"
					step="0.01"
					decimals="2"
					v-model="form.points[7].y"
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
				<div class="text">{{ t('components.easing-preview-reverse.label') }}</div>
				<SelectBox id="easing-preview-reverse" v-model="form.preview.reverse" />
				<div class="text">{{ t('components.easing-preview-duration.label') }}</div>
				<NumberBox
					id="easing-preview-duration"
					min="1"
					max="60000"
					unit="ms"
					v-model="form.preview.duration"
					@change="onDurationInput"
				/>
				<div class="text">{{ t('components.easing-preview-delay.label') }}</div>
				<NumberBox
					id="easing-preview-delay"
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
import { useI18n } from 'vue-i18n';
import { Easing } from '@app/data/transition-window.ts';
import { useEasingWindow } from '@app/composables/useEasingWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const { t } = useI18n();

const easingWindow = useEasingWindow();
const form = easingWindow.form;

const onDurationInput = () => {
	Easing?.durationInput?.();
};

const onDelayInput = () => {
	Easing?.delayInput?.();
};

const onListSelect = (event: Event & { value?: unknown }) => {
	Easing?.listSelect?.(event);
};
const onListOpen = (event: Event & { value?: unknown }) => {
	Easing?.listOpen?.(event);
};
const onListPopup = (event: Event & { value?: unknown }) => {
	Easing?.listPopup?.(event as PointerEvent & { value?: unknown });
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
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
