<template>
	<!-- 设置文本框 - 属性 -->
	<WindowFrame id="setTextBox-property">
		<TitleBar>Text Property<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Property</text><SelectBox id="setTextBox-property-key" />
				<text>Type</text><SelectBox id="setTextBox-property-type" />
				<text>Text</text><StringVar id="setTextBox-property-text" />
				<text>Number</text
				><NumberVar
					id="setTextBox-property-number"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<text>Min</text
				><NumberVar
					id="setTextBox-property-min"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<text>Max</text
				><NumberVar
					id="setTextBox-property-max"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<text>Decimal Places</text
				><NumberBox id="setTextBox-property-decimals" min="0" max="10" />
				<text>Color</text><ColorBox id="setTextBox-property-color" />
			</div>
			<button id="setTextBox-property-confirm" name="confirm">Confirm</button>
			<button id="setTextBox-property-cancel" name="cancel">Cancel</button>
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
import NumberVar from '@app/components/common/NumberVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
