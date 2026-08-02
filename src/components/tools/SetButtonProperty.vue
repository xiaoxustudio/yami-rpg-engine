<template>
		<WindowFrame id="setButton-property">
		<TitleBar>Set Button<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text>Property</text><select-box id="setButton-property-key" />
				<text>Image</text
				><custom-box id="setButton-property-image" type="file" filter="image" />
				<text>Clip</text>
				<box id="setButton-property-clip-box" class="uiElement-grid-box with-4-columns">
					<number-box id="setButton-property-clip-0" min="0" max="10000" />
					<number-box id="setButton-property-clip-1" min="0" max="10000" />
					<number-box id="setButton-property-clip-2" min="0" max="4000" />
					<number-box id="setButton-property-clip-3" min="0" max="4000" />
				</box>
				<text>Tint</text>
				<box id="setButton-property-tint-box" class="uiElement-grid-box with-4-columns">
					<number-box
						id="setButton-property-tint-0"
						min="-255"
						max="255"
						step="5"
					/>
					<number-box
						id="setButton-property-tint-1"
						min="-255"
						max="255"
						step="5"
					/>
					<number-box
						id="setButton-property-tint-2"
						min="-255"
						max="255"
						step="5"
					/>
					<number-box id="setButton-property-tint-3" min="0" max="255" step="5" />
				</box>
				<text>Opacity</text
				><number-box
					id="setButton-property-imageOpacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				/>
				<text>Content</text
				><text-area-var
					id="setButton-property-content"
					menu="tag-local-var tag-global-var tag-dynamic-global-var tag-localization"
				/>
				<text>Size</text
				><number-box id="setButton-property-size" min="10" max="400" unit="px" />
				<text>Letter Spacing</text
				><number-box
					id="setButton-property-letterSpacing"
					min="-10"
					max="100"
					unit="px"
				/>
			</grid-box>
			<button id="setButton-property-confirm" name="confirm">Confirm</button>
			<button id="setButton-property-cancel" name="cancel">Cancel</button>
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
