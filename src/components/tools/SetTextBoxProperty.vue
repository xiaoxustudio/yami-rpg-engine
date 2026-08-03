<template>
	<!-- 设置文本框 - 属性 -->
	<WindowFrame id="setTextBox-property">
		<TitleBar>Text Property<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Property</div><SelectBox id="setTextBox-property-key" />
				<div class="text">Type</div><SelectBox id="setTextBox-property-type" />
				<div class="text">Text</div><StringVar id="setTextBox-property-text" />
				<div class="text">Number</div
				><NumberVar
					id="setTextBox-property-number"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<div class="text">Min</div
				><NumberVar
					id="setTextBox-property-min"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<div class="text">Max</div
				><NumberVar
					id="setTextBox-property-max"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<div class="text">Decimal Places</div
				><NumberBox id="setTextBox-property-decimals" min="0" max="10" />
				<div class="text">Color</div><ColorBox id="setTextBox-property-color" />
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
