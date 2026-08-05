<template>
		<WindowFrame id="setButton-property">
		<template #title><TitleBar>Set Button<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Property</div><SelectBox id="setButton-property-key" />
				<div class="text">Image</div
				><CustomBox id="setButton-property-image" type="file" filter="image" />
				<div class="text">Clip</div>
				<div id="setButton-property-clip-box" class="box uiElement-grid-box with-4-columns">
					<NumberBox id="setButton-property-clip-0" min="0" max="10000" />
					<NumberBox id="setButton-property-clip-1" min="0" max="10000" />
					<NumberBox id="setButton-property-clip-2" min="0" max="4000" />
					<NumberBox id="setButton-property-clip-3" min="0" max="4000" />
				</div>
				<div class="text">Tint</div>
				<div id="setButton-property-tint-box" class="box uiElement-grid-box with-4-columns">
					<NumberBox
						id="setButton-property-tint-0"
						min="-255"
						max="255"
						step="5"
					/>
					<NumberBox
						id="setButton-property-tint-1"
						min="-255"
						max="255"
						step="5"
					/>
					<NumberBox
						id="setButton-property-tint-2"
						min="-255"
						max="255"
						step="5"
					/>
					<NumberBox id="setButton-property-tint-3" min="0" max="255" step="5" />
				</div>
				<div class="text">Opacity</div
				><NumberBox
					id="setButton-property-imageOpacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				/>
				<div class="text">Content</div
				><TextAreaVar
					id="setButton-property-content"
					menu="tag-local-var tag-global-var tag-dynamic-global-var tag-localization"
				/>
				<div class="text">Size</div
				><NumberBox id="setButton-property-size" min="10" max="400" unit="px" />
				<div class="text">Letter Spacing</div
				><NumberBox
					id="setButton-property-letterSpacing"
					min="-10"
					max="100"
					unit="px"
				/>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextAreaVar from '@app/components/common/TextAreaVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
