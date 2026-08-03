<template>
		<WindowFrame id="setDialogBox-property">
		<TitleBar>Dialog Box Property<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Property</div><SelectBox id="setDialogBox-property-key" />
				<div class="text">Content</div
				><TextAreaVar
					id="setDialogBox-property-content"
					menu="tag-local-var tag-global-var tag-localization"
				/>
				<div class="text">Interval</div
				><NumberBox
					id="setDialogBox-property-interval"
					min="0"
					max="100"
					unit="ms"
				/>
				<div class="text">Size</div
				><NumberBox id="setDialogBox-property-size" min="10" max="400" unit="px" />
				<div class="text">Line Spacing</div
				><NumberBox
					id="setDialogBox-property-lineSpacing"
					min="-10"
					max="100"
					unit="px"
				/>
				<div class="text">Letter Spacing</div
				><NumberBox
					id="setDialogBox-property-letterSpacing"
					min="-10"
					max="100"
					unit="px"
				/>
				<div class="text">Color</div><ColorBox id="setDialogBox-property-color" />
				<div class="text">Font</div><TextBox id="setDialogBox-property-font" />
				<div class="text">Effect</div><SelectBox id="setDialogBox-property-effect-type" />
				<div class="text">Shadow X</div
				><NumberBox
					id="setDialogBox-property-effect-shadowOffsetX"
					min="-9"
					max="9"
					unit="px"
				/>
				<div class="text">Shadow Y</div
				><NumberBox
					id="setDialogBox-property-effect-shadowOffsetY"
					min="-9"
					max="9"
					unit="px"
				/>
				<div class="text">Stroke Width</div
				><NumberBox
					id="setDialogBox-property-effect-strokeWidth"
					min="1"
					max="20"
					unit="px"
				/>
				<div class="text">Effect Color</div><ColorBox id="setDialogBox-property-effect-color" />
				<div class="text">Blend</div><SelectBox id="setDialogBox-property-blend" />
			</div>
			<button id="setDialogBox-property-confirm" name="confirm">Confirm</button>
			<button id="setDialogBox-property-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextAreaVar from '@app/components/common/TextAreaVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
