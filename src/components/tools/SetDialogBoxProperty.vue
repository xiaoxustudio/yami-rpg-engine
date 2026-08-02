<template>
		<WindowFrame id="setDialogBox-property">
		<TitleBar>Dialog Box Property<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text>Property</text><select-box id="setDialogBox-property-key" />
				<text>Content</text
				><text-area-var
					id="setDialogBox-property-content"
					menu="tag-local-var tag-global-var tag-localization"
				/>
				<text>Interval</text
				><number-box
					id="setDialogBox-property-interval"
					min="0"
					max="100"
					unit="ms"
				/>
				<text>Size</text
				><number-box id="setDialogBox-property-size" min="10" max="400" unit="px" />
				<text>Line Spacing</text
				><number-box
					id="setDialogBox-property-lineSpacing"
					min="-10"
					max="100"
					unit="px"
				/>
				<text>Letter Spacing</text
				><number-box
					id="setDialogBox-property-letterSpacing"
					min="-10"
					max="100"
					unit="px"
				/>
				<text>Color</text><color-box id="setDialogBox-property-color" />
				<text>Font</text><text-box id="setDialogBox-property-font" />
				<text>Effect</text><select-box id="setDialogBox-property-effect-type" />
				<text>Shadow X</text
				><number-box
					id="setDialogBox-property-effect-shadowOffsetX"
					min="-9"
					max="9"
					unit="px"
				/>
				<text>Shadow Y</text
				><number-box
					id="setDialogBox-property-effect-shadowOffsetY"
					min="-9"
					max="9"
					unit="px"
				/>
				<text>Stroke Width</text
				><number-box
					id="setDialogBox-property-effect-strokeWidth"
					min="1"
					max="20"
					unit="px"
				/>
				<text>Effect Color</text><color-box id="setDialogBox-property-effect-color" />
				<text>Blend</text><select-box id="setDialogBox-property-blend" />
			</grid-box>
			<button id="setDialogBox-property-confirm" name="confirm">Confirm</button>
			<button id="setDialogBox-property-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
