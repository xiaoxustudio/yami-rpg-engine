<template>
		<WindowFrame id="setImage-property">
		<TitleBar>Image Property<div class="close"></div></TitleBar>
		<content-frame>
			<grid-box>
				<text>Property</text><SelectBox id="setImage-property-key" />
				<text>Image</text
				><CustomBox id="setImage-property-image" type="file" filter="image" />
				<text>Display</text><SelectBox id="setImage-property-display" />
				<text>Flip</text><SelectBox id="setImage-property-flip" /> <text>Blend</text
				><SelectBox id="setImage-property-blend" /> <text>Shift X</text
				><NumberVar
					id="setImage-property-shiftX"
					min="-10000"
					max="10000"
					unit="px"
				/>
				<text>Shift Y</text
				><NumberVar
					id="setImage-property-shiftY"
					min="-10000"
					max="10000"
					unit="px"
				/>
				<text>Clip - X</text
				><NumberVar id="setImage-property-clip-0" min="0" max="10000" unit="px" />
				<text>Clip - Y</text
				><NumberVar id="setImage-property-clip-1" min="0" max="10000" unit="px" />
				<text>Clip - Width</text
				><NumberVar id="setImage-property-clip-2" min="0" max="10000" unit="px" />
				<text>Clip - Height</text
				><NumberVar id="setImage-property-clip-3" min="0" max="10000" unit="px" />
			</grid-box>
			<button id="setImage-property-confirm" name="confirm">Confirm</button>
			<button id="setImage-property-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
