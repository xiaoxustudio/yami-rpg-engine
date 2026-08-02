<template>
	<WindowFrame id="moveElement-property">
		<TitleBar>Transform Property<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text>Property</text><SelectBox id="moveElement-property-key" />
				<text>Anchor X</text
				><NumberVar
					id="moveElement-property-anchorX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				/>
				<text>Anchor Y</text
				><NumberVar
					id="moveElement-property-anchorY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				/>
				<text>X</text
				><NumberVar
					id="moveElement-property-x"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				/>
				<text>Y</text
				><NumberVar
					id="moveElement-property-y"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				/>
				<text>Width</text
				><NumberVar
					id="moveElement-property-width"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				/>
				<text>Height</text
				><NumberVar
					id="moveElement-property-height"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				/>
				<text>X2</text
				><NumberVar
					id="moveElement-property-x2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
				/>
				<text>Y2</text
				><NumberVar
					id="moveElement-property-y2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
				/>
				<text>Width2</text
				><NumberVar
					id="moveElement-property-width2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
				/>
				<text>Height2</text
				><NumberVar
					id="moveElement-property-height2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
				/>
				<text>Rotation</text
				><NumberVar
					id="moveElement-property-rotation"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg"
				/>
				<text>Scale X</text
				><NumberVar
					id="moveElement-property-scaleX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				/>
				<text>Scale Y</text
				><NumberVar
					id="moveElement-property-scaleY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				/>
				<text>Skew X</text
				><NumberVar
					id="moveElement-property-skewX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				/>
				<text>Skew Y</text
				><NumberVar
					id="moveElement-property-skewY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				/>
				<text>Opacity</text
				><NumberVar
					id="moveElement-property-opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				/>
			</grid-box>
			<button id="moveElement-property-confirm" name="confirm">Confirm</button>
			<button id="moveElement-property-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
