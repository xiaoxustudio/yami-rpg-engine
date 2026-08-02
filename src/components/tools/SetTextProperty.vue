<template>
	<!-- 设置文本 - 属性 -->
	<WindowFrame id="setText-property">
		<TitleBar>Text Property<div class="close" /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Property</text><SelectBox id="setText-property-key" />
				<text>Content</text
				><TextAreaVar
					id="setText-property-content"
					menu="tag-local-var tag-global-var tag-dynamic-global-var tag-localization"
				/>
				<text>Size</text
				><NumberBox id="setText-property-size" min="10" max="400" unit="px" />
				<text>Line Spacing</text
				><NumberBox
					id="setText-property-lineSpacing"
					min="-10"
					max="100"
					unit="px"
				/>
				<text>Letter Spacing</text
				><NumberBox
					id="setText-property-letterSpacing"
					min="-10"
					max="100"
					unit="px"
				/>
				<text>Color</text><ColorBox id="setText-property-color" /> <text>Font</text
				><TextBox id="setText-property-font" /> <text>Effect</text
				><SelectBox id="setText-property-effect-type" /> <text>Shadow X</text
				><NumberBox
					id="setText-property-effect-shadowOffsetX"
					min="-9"
					max="9"
					unit="px"
				/>
				<text>Shadow Y</text
				><NumberBox
					id="setText-property-effect-shadowOffsetY"
					min="-9"
					max="9"
					unit="px"
				/>
				<text>Stroke Width</text
				><NumberBox
					id="setText-property-effect-strokeWidth"
					min="1"
					max="20"
					unit="px"
				/>
				<text>Effect Color</text><ColorBox id="setText-property-effect-color" />
				<text>Blend</text><SelectBox id="setText-property-blend" />
			</grid-box>
			<button id="setText-property-confirm" name="confirm">Confirm</button>
			<button id="setText-property-cancel" name="cancel">Cancel</button>
		</content-frame>
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
