<template>
		<window-frame id="setImage-property">
		<title-bar>Image Property<close></close></title-bar>
		<content-frame>
			<grid-box>
				<text>Property</text><select-box id="setImage-property-key" />
				<text>Image</text
				><custom-box id="setImage-property-image" type="file" filter="image" />
				<text>Display</text><select-box id="setImage-property-display" />
				<text>Flip</text><select-box id="setImage-property-flip" /> <text>Blend</text
				><select-box id="setImage-property-blend" /> <text>Shift X</text
				><number-var
					id="setImage-property-shiftX"
					min="-10000"
					max="10000"
					unit="px"
				/>
				<text>Shift Y</text
				><number-var
					id="setImage-property-shiftY"
					min="-10000"
					max="10000"
					unit="px"
				/>
				<text>Clip - X</text
				><number-var id="setImage-property-clip-0" min="0" max="10000" unit="px" />
				<text>Clip - Y</text
				><number-var id="setImage-property-clip-1" min="0" max="10000" unit="px" />
				<text>Clip - Width</text
				><number-var id="setImage-property-clip-2" min="0" max="10000" unit="px" />
				<text>Clip - Height</text
				><number-var id="setImage-property-clip-3" min="0" max="10000" unit="px" />
			</grid-box>
			<button id="setImage-property-confirm" name="confirm">Confirm</button>
			<button id="setImage-property-cancel" name="cancel">Cancel</button>
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
