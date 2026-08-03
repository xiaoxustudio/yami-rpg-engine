<template>
<WindowFrame id="transition">
	<TitleBar>Transition<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<text>Write to Variable</text
			><CustomBox id="transition-variable" type="variable" filter="number" />
			<text>Start Value</text
			><NumberVar
				id="transition-start"
				min="-1000000000"
				max="1000000000"
				decimals="10"
			 />
			<text>End Value</text
			><NumberVar
				id="transition-end"
				min="-1000000000"
				max="1000000000"
				decimals="10"
			 />
			<text>Easing</text><SelectBox id="transition-easingId" name="easing" />
			<text>Duration</text
			><NumberVar
				id="transition-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
			 />
		</div>
		<button id="transition-confirm" name="confirm">Confirm</button>
		<button id="transition-cancel" name="cancel">Cancel</button>
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
