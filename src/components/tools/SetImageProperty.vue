<template>
		<WindowFrame id="setImage-property">
		<TitleBar>Image Property<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Property</div><SelectBox id="setImage-property-key" />
				<div class="text">Image</div
				><CustomBox id="setImage-property-image" type="file" filter="image" />
				<div class="text">Display</div><SelectBox id="setImage-property-display" />
				<div class="text">Flip</div><SelectBox id="setImage-property-flip" /> <div class="text">Blend</div
				><SelectBox id="setImage-property-blend" /> <div class="text">Shift X</div
				><NumberVar
					id="setImage-property-shiftX"
					min="-10000"
					max="10000"
					unit="px"
				/>
				<div class="text">Shift Y</div
				><NumberVar
					id="setImage-property-shiftY"
					min="-10000"
					max="10000"
					unit="px"
				/>
				<div class="text">Clip - X</div
				><NumberVar id="setImage-property-clip-0" min="0" max="10000" unit="px" />
				<div class="text">Clip - Y</div
				><NumberVar id="setImage-property-clip-1" min="0" max="10000" unit="px" />
				<div class="text">Clip - Width</div
				><NumberVar id="setImage-property-clip-2" min="0" max="10000" unit="px" />
				<div class="text">Clip - Height</div
				><NumberVar id="setImage-property-clip-3" min="0" max="10000" unit="px" />
			</div>
			<button id="setImage-property-confirm" name="confirm">Confirm</button>
			<button id="setImage-property-cancel" name="cancel">Cancel</button>
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
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
