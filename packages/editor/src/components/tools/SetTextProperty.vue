<template>
	<!-- 设置文本 - 属性 -->
	<WindowFrame id="setText-property">
		<template #title><TitleBar>Text Property<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Property</div><SelectBox id="setText-property-key" />
				<div class="text">Content</div
				><TextAreaVar
					id="setText-property-content"
					menu="tag-local-var tag-global-var tag-dynamic-global-var tag-localization"
				/>
				<div class="text">Size</div
				><NumberBox id="setText-property-size" min="10" max="400" unit="px" />
				<div class="text">Line Spacing</div
				><NumberBox
					id="setText-property-lineSpacing"
					min="-10"
					max="100"
					unit="px"
				/>
				<div class="text">Letter Spacing</div
				><NumberBox
					id="setText-property-letterSpacing"
					min="-10"
					max="100"
					unit="px"
				/>
				<div class="text">Color</div><ColorBox id="setText-property-color" /> <div class="text">Font</div
				><TextBox id="setText-property-font" /> <div class="text">Effect</div
				><SelectBox id="setText-property-effect-type" /> <div class="text">Shadow X</div
				><NumberBox
					id="setText-property-effect-shadowOffsetX"
					min="-9"
					max="9"
					unit="px"
				/>
				<div class="text">Shadow Y</div
				><NumberBox
					id="setText-property-effect-shadowOffsetY"
					min="-9"
					max="9"
					unit="px"
				/>
				<div class="text">Stroke Width</div
				><NumberBox
					id="setText-property-effect-strokeWidth"
					min="1"
					max="20"
					unit="px"
				/>
				<div class="text">Effect Color</div><ColorBox id="setText-property-effect-color" />
				<div class="text">Blend</div><SelectBox id="setText-property-blend" />
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


});
</script>
