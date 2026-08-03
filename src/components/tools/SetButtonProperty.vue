<template>
		<WindowFrame id="setButton-property">
		<TitleBar>Set Button<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Property</text><SelectBox id="setButton-property-key" />
				<text>Image</text
				><CustomBox id="setButton-property-image" type="file" filter="image" />
				<text>Clip</text>
				<box id="setButton-property-clip-box" class="uiElement-grid-box with-4-columns">
					<NumberBox id="setButton-property-clip-0" min="0" max="10000" />
					<NumberBox id="setButton-property-clip-1" min="0" max="10000" />
					<NumberBox id="setButton-property-clip-2" min="0" max="4000" />
					<NumberBox id="setButton-property-clip-3" min="0" max="4000" />
				</box>
				<text>Tint</text>
				<box id="setButton-property-tint-box" class="uiElement-grid-box with-4-columns">
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
				</box>
				<text>Opacity</text
				><NumberBox
					id="setButton-property-imageOpacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				/>
				<text>Content</text
				><TextAreaVar
					id="setButton-property-content"
					menu="tag-local-var tag-global-var tag-dynamic-global-var tag-localization"
				/>
				<text>Size</text
				><NumberBox id="setButton-property-size" min="10" max="400" unit="px" />
				<text>Letter Spacing</text
				><NumberBox
					id="setButton-property-letterSpacing"
					min="-10"
					max="100"
					unit="px"
				/>
			</div>
			<button id="setButton-property-confirm" name="confirm">Confirm</button>
			<button id="setButton-property-cancel" name="cancel">Cancel</button>
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
