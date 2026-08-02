<template>
	<WindowFrame id="easing">
		<TitleBar>Easing<close /></TitleBar>
		<content-frame>
			<field-set id="easing-list-fieldset" class="input pad">
				<legend>List</legend>
				<TreeList id="easing-list" padded />
			</field-set>
			<field-set id="easing-points-fieldset">
				<legend>Points</legend>
				<grid-box id="easing-points-grid">
					<text>Mode</text><SelectBox id="easing-mode" />
					<text id="easing-points-0">Point 1</text>
					<NumberBox id="easing-points-0-x" min="0" max="1" step="0.01" decimals="2"
						><text class="label">X</text></NumberBox
					>
					<NumberBox id="easing-points-0-y" min="-5" max="5" step="0.01" decimals="2"
						><text class="label">Y</text></NumberBox
					>
					<text id="easing-points-1">Point 2</text>
					<NumberBox id="easing-points-1-x" min="0" max="1" step="0.01" decimals="2"
						><text class="label">X</text></NumberBox
					>
					<NumberBox id="easing-points-1-y" min="-5" max="5" step="0.01" decimals="2"
						><text class="label">Y</text></NumberBox
					>
					<text id="easing-points-2">Point 3</text>
					<NumberBox id="easing-points-2-x" min="0" max="1" step="0.01" decimals="2"
						><text class="label">X</text></NumberBox
					>
					<NumberBox id="easing-points-2-y" min="-5" max="5" step="0.01" decimals="2"
						><text class="label">Y</text></NumberBox
					>
					<text id="easing-points-3">Point 4</text>
					<NumberBox id="easing-points-3-x" min="0" max="1" step="0.01" decimals="2"
						><text class="label">X</text></NumberBox
					>
					<NumberBox id="easing-points-3-y" min="-5" max="5" step="0.01" decimals="2"
						><text class="label">Y</text></NumberBox
					>
					<text id="easing-points-4">Point 5</text>
					<NumberBox id="easing-points-4-x" min="0" max="1" step="0.01" decimals="2"
						><text class="label">X</text></NumberBox
					>
					<NumberBox id="easing-points-4-y" min="-5" max="5" step="0.01" decimals="2"
						><text class="label">Y</text></NumberBox
					>
					<text id="easing-points-5">Point 6</text>
					<NumberBox id="easing-points-5-x" min="0" max="1" step="0.01" decimals="2"
						><text class="label">X</text></NumberBox
					>
					<NumberBox id="easing-points-5-y" min="-5" max="5" step="0.01" decimals="2"
						><text class="label">Y</text></NumberBox
					>
					<text id="easing-points-6">Point 7</text>
					<NumberBox id="easing-points-6-x" min="0" max="1" step="0.01" decimals="2"
						><text class="label">X</text></NumberBox
					>
					<NumberBox id="easing-points-6-y" min="-5" max="5" step="0.01" decimals="2"
						><text class="label">Y</text></NumberBox
					>
					<text id="easing-points-7">Point 8</text>
					<NumberBox id="easing-points-7-x" min="0" max="1" step="0.01" decimals="2"
						><text class="label">X</text></NumberBox
					>
					<NumberBox id="easing-points-7-y" min="-5" max="5" step="0.01" decimals="2"
						><text class="label">Y</text></NumberBox
					>
				</grid-box>
			</field-set>
			<field-set id="easing-curve-fieldset">
				<legend>Curve</legend>
				<canvas id="easing-curve-canvas" width="0" height="0" tabindex="-1" />
				<RadioBox name="easing-scale" value="1">100%</RadioBox>
				<RadioBox name="easing-scale" value="0.5">50%</RadioBox>
			</field-set>
			<field-set id="easing-preview-fieldset">
				<legend>Preview</legend>
				<canvas id="easing-preview-canvas" width="0" height="0" />
				<grid-box id="easing-preview-grid">
					<text>Reverse</text><SelectBox id="easing-preview-reverse" />
					<text>Duration</text
					><NumberBox
						id="easing-preview-duration"
						min="1"
						max="60000"
						unit="ms"
					/>
					<text>Wait</text
					><NumberBox id="easing-preview-delay" min="0" max="5000" unit="ms" />
				</grid-box>
			</field-set>
			<button id="easing-confirm" name="confirm">Confirm</button>
			<button id="easing-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberBox from '@app/components/common/NumberBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
