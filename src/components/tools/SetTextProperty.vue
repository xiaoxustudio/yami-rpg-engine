<template>
	<!-- 设置文本 - 属性 -->
	<window-frame id="setText-property">
		<title-bar>Text Property<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Property</text><select-box id="setText-property-key" />
				<text>Content</text
				><text-area-var
					id="setText-property-content"
					menu="tag-local-var tag-global-var tag-dynamic-global-var tag-localization"
				/>
				<text>Size</text
				><number-box id="setText-property-size" min="10" max="400" unit="px" />
				<text>Line Spacing</text
				><number-box
					id="setText-property-lineSpacing"
					min="-10"
					max="100"
					unit="px"
				/>
				<text>Letter Spacing</text
				><number-box
					id="setText-property-letterSpacing"
					min="-10"
					max="100"
					unit="px"
				/>
				<text>Color</text><color-box id="setText-property-color" /> <text>Font</text
				><text-box id="setText-property-font" /> <text>Effect</text
				><select-box id="setText-property-effect-type" /> <text>Shadow X</text
				><number-box
					id="setText-property-effect-shadowOffsetX"
					min="-9"
					max="9"
					unit="px"
				/>
				<text>Shadow Y</text
				><number-box
					id="setText-property-effect-shadowOffsetY"
					min="-9"
					max="9"
					unit="px"
				/>
				<text>Stroke Width</text
				><number-box
					id="setText-property-effect-strokeWidth"
					min="1"
					max="20"
					unit="px"
				/>
				<text>Effect Color</text><color-box id="setText-property-effect-color" />
				<text>Blend</text><select-box id="setText-property-blend" />
			</grid-box>
			<button id="setText-property-confirm" name="confirm">Confirm</button>
			<button id="setText-property-cancel" name="cancel">Cancel</button>
		</content-frame>
	</window-frame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
