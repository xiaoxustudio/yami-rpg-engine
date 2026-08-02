<template>
	<!-- 设置窗口 - 属性 -->
	<WindowFrame id="setWindow-property">
		<TitleBar>Window Property<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Property</text><select-box id="setWindow-property-key" />
				<text>Scroll X</text
				><number-var id="setWindow-property-scrollX" min="0" max="10000" unit="px" />
				<text>Scroll Y</text
				><number-var id="setWindow-property-scrollY" min="0" max="10000" unit="px" />
				<text>Grid Width</text
				><number-var
					id="setWindow-property-gridWidth"
					min="0"
					max="1000"
					unit="px"
				/>
				<text>Grid Height</text
				><number-var
					id="setWindow-property-gridHeight"
					min="0"
					max="1000"
					unit="px"
				/>
				<text>Grid Gap X</text
				><number-var id="setWindow-property-gridGapX" min="0" max="1000" unit="px" />
				<text>Grid Gap Y</text
				><number-var id="setWindow-property-gridGapY" min="0" max="1000" unit="px" />
				<text>Padding X</text
				><number-var id="setWindow-property-paddingX" min="0" max="1000" unit="px" />
				<text>Padding Y</text
				><number-var id="setWindow-property-paddingY" min="0" max="1000" unit="px" />
			</grid-box>
			<button id="setWindow-property-confirm" name="confirm">Confirm</button>
			<button id="setWindow-property-cancel" name="cancel">Cancel</button>
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
