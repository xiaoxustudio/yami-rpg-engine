<template>
	<WindowFrame id="autoTile">
		<template #title><TitleBar>Auto Tile<div class="close" /></TitleBar></template>
		
			<div class="field-set" id="autoTile-general-fieldset">
				<div class="legend">General</div>
				<div class="grid-box" id="autoTile-general-grid">
					<div class="text">Image</div
					><CustomBox id="autoTile-image" type="file" filter="image" />
					<div class="text">Offset X</div><NumberBox id="autoTile-x" min="0" max="255" />
					<div class="text">Offset Y</div><NumberBox id="autoTile-y" min="0" max="255" />
				</div>
			</div>
			<div class="field-set input pad" id="autoTile-templates-fieldset">
				<div class="legend">Templates</div>
				<TreeList
					id="autoTile-templates"
					padded
					:node-extras="nodeExtras"
					@select="onTemplatesSelect"
					@popup="onTemplatesPopup"
					@change="onTemplatesChange"
				/>
			</div>
			<div class="field-set input pad" id="autoTile-nodes-fieldset">
				<div class="legend">Tiles</div>
				<CommonList id="autoTile-nodes" />
			</div>
			<div class="field-set" id="autoTile-canvas-fieldset">
				<div class="legend">View</div>
				<canvas id="autoTile-canvas" width="128" height="128" />
			</div>
			<div class="field-set" id="autoTile-rule-fieldset">
				<div class="legend">Neighbors</div>
				<div class="grid-box" id="autoTile-rule-grid">
					<SwitchItem
						id="autoTile-rule-1"
						class="autoTile-switch autoTile-neighbor"
						:length="3"
					/>
					<SwitchItem
						id="autoTile-rule-2"
						class="autoTile-switch autoTile-neighbor"
						:length="3"
					/>
					<SwitchItem
						id="autoTile-rule-3"
						class="autoTile-switch autoTile-neighbor"
						:length="3"
					/>
					<SwitchItem
						id="autoTile-rule-0"
						class="autoTile-switch autoTile-neighbor"
						:length="3"
					/>
					<div class="empty" />
					<SwitchItem
						id="autoTile-rule-4"
						class="autoTile-switch autoTile-neighbor"
						:length="3"
					/>
					<SwitchItem
						id="autoTile-rule-7"
						class="autoTile-switch autoTile-neighbor"
						:length="3"
					/>
					<SwitchItem
						id="autoTile-rule-6"
						class="autoTile-switch autoTile-neighbor"
						:length="3"
					/>
					<SwitchItem
						id="autoTile-rule-5"
						class="autoTile-switch autoTile-neighbor"
						:length="3"
					/>
				</div>
			</div>
			<div class="field-set input pad" id="autoTile-frames-fieldset">
				<div class="legend">Frames</div>
				<CommonList id="autoTile-frames" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, type VNode } from 'vue';
import { AutoTile } from '@/palette/auto-tile.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import SwitchItem from '@app/components/common/SwitchItem.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import CommonList from '@app/components/common/CommonList.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const nodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	container.parentNode?.classList.add('plain');
	return [];
};

const onTemplatesSelect = (event: Event & { value?: unknown }) => {
	AutoTile?.templatesSelect?.(event);
};
const onTemplatesPopup = (event: PointerEvent & { value?: unknown }) => {
	AutoTile?.templatesPopup?.(event);
};
const onTemplatesChange = (event: Event & { value?: unknown }) => {
	AutoTile?.templatesChange?.(event);
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
