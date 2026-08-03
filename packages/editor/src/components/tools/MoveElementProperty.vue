<template>
	<WindowFrame id="moveElement-property">
		<TitleBar>Transform Property<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Property</div><SelectBox id="moveElement-property-key" />
				<div class="text">Anchor X</div
				><NumberVar
					id="moveElement-property-anchorX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				/>
				<div class="text">Anchor Y</div
				><NumberVar
					id="moveElement-property-anchorY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				/>
				<div class="text">X</div
				><NumberVar
					id="moveElement-property-x"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				/>
				<div class="text">Y</div
				><NumberVar
					id="moveElement-property-y"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				/>
				<div class="text">Width</div
				><NumberVar
					id="moveElement-property-width"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				/>
				<div class="text">Height</div
				><NumberVar
					id="moveElement-property-height"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				/>
				<div class="text">X2</div
				><NumberVar
					id="moveElement-property-x2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
				/>
				<div class="text">Y2</div
				><NumberVar
					id="moveElement-property-y2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
				/>
				<div class="text">Width2</div
				><NumberVar
					id="moveElement-property-width2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
				/>
				<div class="text">Height2</div
				><NumberVar
					id="moveElement-property-height2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
				/>
				<div class="text">Rotation</div
				><NumberVar
					id="moveElement-property-rotation"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg"
				/>
				<div class="text">Scale X</div
				><NumberVar
					id="moveElement-property-scaleX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				/>
				<div class="text">Scale Y</div
				><NumberVar
					id="moveElement-property-scaleY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				/>
				<div class="text">Skew X</div
				><NumberVar
					id="moveElement-property-skewX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				/>
				<div class="text">Skew Y</div
				><NumberVar
					id="moveElement-property-skewY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				/>
				<div class="text">Opacity</div
				><NumberVar
					id="moveElement-property-opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				/>
			</div>
			<button id="moveElement-property-confirm" name="confirm">Confirm</button>
			<button id="moveElement-property-cancel" name="cancel">Cancel</button>
		</div>
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
