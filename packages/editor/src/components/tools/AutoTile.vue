<template>
	<WindowFrame id="autoTile"
				:ref="registryRef(paletteEls, 'autoTile')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.autoTile.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="field-set" id="autoTile-general-fieldset">
			<div class="legend">{{ t('components.autoTile-general-grid.label') }}</div>
			<div class="grid-box" id="autoTile-general-grid">
				<div class="text">{{ t('components.autoTile-image.label') }}</div>
				<CustomBox
					id="autoTile-image"
				v-tip="t('components.autoTile-image.tip')"
					v-focus
					type="file"
					filter="image"
					v-model="autoTileStore.imageId"
					@input="onImageInput"
				/>
				<div class="text">{{ t('components.autoTile-x.label') }}</div>
				<NumberBox
					id="autoTile-x"
				v-tip="t('components.autoTile-x.tip')"
					min="0"
					max="255"
					v-model="autoTileStore.offsetX"
					@input="onOffsetXInput"
				/>
				<div class="text">{{ t('components.autoTile-y.label') }}</div>
				<NumberBox
					id="autoTile-y"
				v-tip="t('components.autoTile-y.tip')"
					min="0"
					max="255"
					v-model="autoTileStore.offsetY"
					@input="onOffsetYInput"
				/>
			</div>
		</div>
		<div class="field-set input pad" id="autoTile-templates-fieldset">
			<div class="legend">{{ t('components.autoTile-templates.label') }}</div>
			<TreeList
				id="autoTile-templates"
				v-tip="t('components.autoTile-templates.tip')"
				:ref="registryRef(paletteEls, 'autoTile-templates')"
				padded
				:node-extras="nodeExtras"
				@select="onTemplatesSelect"
				@popup="onTemplatesPopup"
				@change="onTemplatesChange"
			/>
		</div>
		<div class="field-set input pad" id="autoTile-nodes-fieldset">
			<div class="legend">{{ t('components.autoTile-nodes.label') }}</div>
			<CommonList id="autoTile-nodes"
				v-tip="t('components.autoTile-nodes.tip')"
				:ref="registryRef(paletteEls, 'autoTile-nodes')" @write="onNodesWrite" @popup="onNodesPopup" />
		</div>
		<div class="field-set" id="autoTile-canvas-fieldset">
			<div class="legend">{{ t('components.autoTile-canvas.label') }}</div>
			<canvas id="autoTile-canvas"
				v-tip="t('components.autoTile-canvas.tip')"
				:ref="registryRef(paletteEls, 'autoTile-canvas')" width="128" height="128" @click="onCanvasClick" />
		</div>
		<div class="field-set" id="autoTile-rule-fieldset">
			<div class="legend">{{ t('components.autoTile-rule-grid.label') }}</div>
		<div class="grid-box" id="autoTile-rule-grid"
				v-tip="t('components.autoTile-rule-grid.tip')">
			<SwitchItem
				id="autoTile-rule-1"
				v-tip="t('components.autoTile-rule-1.tip')"
				class="autoTile-switch autoTile-neighbor"
				:length="3"
				v-model="autoTileStore.ruleBits[1]"
				@input="onRuleNeighborInput"
			/>
			<SwitchItem
				id="autoTile-rule-2"
				v-tip="t('components.autoTile-rule-2.tip')"
				class="autoTile-switch autoTile-neighbor"
				:length="3"
				v-model="autoTileStore.ruleBits[2]"
				@input="onRuleNeighborInput"
			/>
			<SwitchItem
				id="autoTile-rule-3"
				v-tip="t('components.autoTile-rule-3.tip')"
				class="autoTile-switch autoTile-neighbor"
				:length="3"
				v-model="autoTileStore.ruleBits[3]"
				@input="onRuleNeighborInput"
			/>
			<SwitchItem
				id="autoTile-rule-0"
				v-tip="t('components.autoTile-rule-0.tip')"
				class="autoTile-switch autoTile-neighbor"
				:length="3"
				v-model="autoTileStore.ruleBits[0]"
				@input="onRuleNeighborInput"
			/>
			<div class="empty" />
			<SwitchItem
				id="autoTile-rule-4"
				v-tip="t('components.autoTile-rule-4.tip')"
				class="autoTile-switch autoTile-neighbor"
				:length="3"
				v-model="autoTileStore.ruleBits[4]"
				@input="onRuleNeighborInput"
			/>
			<SwitchItem
				id="autoTile-rule-7"
				v-tip="t('components.autoTile-rule-7.tip')"
				class="autoTile-switch autoTile-neighbor"
				:length="3"
				v-model="autoTileStore.ruleBits[7]"
				@input="onRuleNeighborInput"
			/>
			<SwitchItem
				id="autoTile-rule-6"
				v-tip="t('components.autoTile-rule-6.tip')"
				class="autoTile-switch autoTile-neighbor"
				:length="3"
				v-model="autoTileStore.ruleBits[6]"
				@input="onRuleNeighborInput"
			/>
			<SwitchItem
				id="autoTile-rule-5"
				v-tip="t('components.autoTile-rule-5.tip')"
				class="autoTile-switch autoTile-neighbor"
				:length="3"
				v-model="autoTileStore.ruleBits[5]"
				@input="onRuleNeighborInput"
			/>
		</div>
		</div>
		<div class="field-set input pad" id="autoTile-frames-fieldset">
			<div class="legend">{{ t('components.autoTile-frames.label') }}</div>
			<CommonList id="autoTile-frames"
				v-tip="t('components.autoTile-frames.tip')"
				:ref="registryRef(paletteEls, 'autoTile-frames')" @write="onFramesWrite" @popup="onFramesPopup" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, type VNode } from 'vue';
import { paletteEls } from '@app/palette/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { AutoTile } from '@app/palette/auto-tile.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useAutoTileStore } from '@app/stores/auto-tile';
import SwitchItem from '@app/components/common/SwitchItem.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import CommonList from '@app/components/common/CommonList.vue';
import TreeList from '@app/components/common/TreeList.vue';

const { t } = useI18n();

const autoTileStore = useAutoTileStore();

const nodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	(container.parentNode as HTMLElement | null)?.classList.add('plain');
	const node = item as { id?: string };
	const count = AutoTile.templateCounts?.[node.id ?? ''];
	return [
		h(
			'span',
			{
				class: 'autoTile-count',
				style: 'color: var(--team-relation-mark-color-friend);padding:4px 2px;margin-left: 4px;'
			},
			String(count ?? 0)
		)
	];
};

const onTemplatesSelect = (event: Event & { value?: unknown }) => {
	AutoTile?.templatesSelect?.(event);
};
const onTemplatesPopup = (event: Event & { value?: unknown }) => {
	AutoTile?.templatesPopup?.(event as MouseEvent & { value?: unknown });
};
const onTemplatesChange = (event: Event & { value?: unknown }) => {
	AutoTile?.templatesChange?.(event);
};
const onCanvasClick = () => {
	AutoTile?.canvasClick?.();
};
const onImageInput = (value: unknown) => {
	AutoTile?.imageInput?.({ value });
};
const onOffsetXInput = () => {
	AutoTile?.offsetXInput?.();
};
const onOffsetYInput = () => {
	AutoTile?.offsetYInput?.();
};
const onNodesWrite = (value: unknown) => {
	AutoTile?.nodesWrite?.({ value });
};
const onRuleNeighborInput = () => {
	AutoTile?.ruleNeighborInput?.();
};
const onNodesPopup = (value: unknown, clientX: number, clientY: number) => {
	AutoTile?.nodesPopup?.({ value, clientX, clientY });
};
const onFramesWrite = (value: unknown) => {
	AutoTile?.framesWrite?.({ value });
};
const onFramesPopup = (value: unknown, clientX: number, clientY: number) => {
	AutoTile?.framesPopup?.({ value, clientX, clientY });
};
const onConfirm = () => {
	AutoTile?.confirm?.();
};

onMounted(() => {});
</script>

<style>
/* 窗口样式迁移：由 Project/css/inspector.css 迁入组件（选择器为全局 id，不能用 scoped） */
#autoTile {
	width: 504px;
	height: 520px;
}

#autoTile-general-fieldset {
	left: 10px;
	top: 10px;
	width: 342px;
	height: 90px;
}

#autoTile-templates-fieldset {
	left: 10px;
	top: 110px;
	width: 200px;
	height: 342px;
}

#autoTile-templates {
	font-family: var(--font-family-mono);
}

#autoTile-nodes-fieldset {
	left: 220px;
	top: 110px;
	width: 132px;
	height: 342px;
}

#autoTile-nodes {
	font-family: var(--font-family-mono);
}

#autoTile-canvas-fieldset {
	left: 362px;
	top: 10px;
	width: 132px;
	height: 132px;
}

#autoTile-canvas {
	position: absolute;
	left: 1px;
	top: 1px;
	width: calc(100% - 2px);
	height: calc(100% - 2px);
	background-image: var(--grid-background);
	background-size: var(--16dpx);
}

#autoTile-rule-fieldset {
	left: 362px;
	top: 152px;
	width: 132px;
	height: 132px;
}

#autoTile-rule-grid {
	grid-gap: 10px;
	grid-template-columns: 30px 30px 30px;
}

#autoTile-frames-fieldset {
	left: 362px;
	top: 294px;
	width: 132px;
	height: 158px;
}

#autoTile-frames {
	font-family: var(--font-family-mono);
}

#autoTile-confirm {
	right: 108px;
	bottom: 10px;
}

#autoTile-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

