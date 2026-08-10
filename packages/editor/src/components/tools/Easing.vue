<template>
	<WindowFrame id="easing">
		<template #title><TitleBar>Easing<div class="close" /></TitleBar></template>
		
			<div class="field-set input pad" id="easing-list-fieldset">
				<div class="legend">List</div>
				<TreeList
					id="easing-list"
					padded
					@select="onListSelect"
					@open="onListOpen"
					@popup="onListPopup"
					@change="onListChange"
				/>
			</div>
			<div class="field-set" id="easing-points-fieldset">
				<div class="legend">Points</div>
				<div class="grid-box" id="easing-points-grid">
					<div class="text">Mode</div><SelectBox id="easing-mode" />
					<div class="text" id="easing-points-0">Point 1</div>
					<NumberBox id="easing-points-0-x" min="0" max="1" step="0.01" decimals="2"
						><div class="text label">X</div></NumberBox
					>
					<NumberBox id="easing-points-0-y" min="-5" max="5" step="0.01" decimals="2"
						><div class="text label">Y</div></NumberBox
					>
					<div class="text" id="easing-points-1">Point 2</div>
					<NumberBox id="easing-points-1-x" min="0" max="1" step="0.01" decimals="2"
						><div class="text label">X</div></NumberBox
					>
					<NumberBox id="easing-points-1-y" min="-5" max="5" step="0.01" decimals="2"
						><div class="text label">Y</div></NumberBox
					>
					<div class="text" id="easing-points-2">Point 3</div>
					<NumberBox id="easing-points-2-x" min="0" max="1" step="0.01" decimals="2"
						><div class="text label">X</div></NumberBox
					>
					<NumberBox id="easing-points-2-y" min="-5" max="5" step="0.01" decimals="2"
						><div class="text label">Y</div></NumberBox
					>
					<div class="text" id="easing-points-3">Point 4</div>
					<NumberBox id="easing-points-3-x" min="0" max="1" step="0.01" decimals="2"
						><div class="text label">X</div></NumberBox
					>
					<NumberBox id="easing-points-3-y" min="-5" max="5" step="0.01" decimals="2"
						><div class="text label">Y</div></NumberBox
					>
					<div class="text" id="easing-points-4">Point 5</div>
					<NumberBox id="easing-points-4-x" min="0" max="1" step="0.01" decimals="2"
						><div class="text label">X</div></NumberBox
					>
					<NumberBox id="easing-points-4-y" min="-5" max="5" step="0.01" decimals="2"
						><div class="text label">Y</div></NumberBox
					>
					<div class="text" id="easing-points-5">Point 6</div>
					<NumberBox id="easing-points-5-x" min="0" max="1" step="0.01" decimals="2"
						><div class="text label">X</div></NumberBox
					>
					<NumberBox id="easing-points-5-y" min="-5" max="5" step="0.01" decimals="2"
						><div class="text label">Y</div></NumberBox
					>
					<div class="text" id="easing-points-6">Point 7</div>
					<NumberBox id="easing-points-6-x" min="0" max="1" step="0.01" decimals="2"
						><div class="text label">X</div></NumberBox
					>
					<NumberBox id="easing-points-6-y" min="-5" max="5" step="0.01" decimals="2"
						><div class="text label">Y</div></NumberBox
					>
					<div class="text" id="easing-points-7">Point 8</div>
					<NumberBox id="easing-points-7-x" min="0" max="1" step="0.01" decimals="2"
						><div class="text label">X</div></NumberBox
					>
					<NumberBox id="easing-points-7-y" min="-5" max="5" step="0.01" decimals="2"
						><div class="text label">Y</div></NumberBox
					>
				</div>
			</div>
			<div class="field-set" id="easing-curve-fieldset">
				<div class="legend">Curve</div>
				<canvas id="easing-curve-canvas" width="0" height="0" tabindex="-1" />
				<RadioBox name="easing-scale" value="1">100%</RadioBox>
				<RadioBox name="easing-scale" value="0.5">50%</RadioBox>
			</div>
			<div class="field-set" id="easing-preview-fieldset">
				<div class="legend">Preview</div>
				<canvas id="easing-preview-canvas" width="0" height="0" />
				<div class="grid-box" id="easing-preview-grid">
					<div class="text">Reverse</div><SelectBox id="easing-preview-reverse" />
					<div class="text">Duration</div
					><NumberBox
						id="easing-preview-duration"
						min="1"
						max="60000"
						unit="ms"
					/>
					<div class="text">Wait</div
					><NumberBox id="easing-preview-delay" min="0" max="5000" unit="ms" />
				</div>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Easing } from '@/data/transition-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberBox from '@app/components/common/NumberBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const onListSelect = (event: any) => {
	Easing?.listSelect?.(event);
};
const onListOpen = (event: any) => {
	Easing?.listOpen?.(event);
};
const onListPopup = (event: any) => {
	Easing?.listPopup?.(event);
};
const onListChange = (event: any) => {
	Easing?.dataChange?.(event);
};

const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
