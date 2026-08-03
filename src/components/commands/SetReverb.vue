<template>
<WindowFrame id="setReverb">
	<TitleBar>Set Reverb<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<div class="text">Type</div><SelectBox id="setReverb-type" /> <div class="text">Dry</div
			><NumberVar id="setReverb-dry" min="0" max="1" step="0.1" decimals="4" />
			<div class="text">Wet</div
			><NumberVar id="setReverb-wet" min="0" max="1" step="0.1" decimals="4" />
			<div class="text">Easing</div><SelectBox id="setReverb-easingId" name="easing" />
			<div class="text">Duration</div
			><NumberBox
				id="setReverb-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
			 />
			<div class="text">Wait</div><SelectBox id="setReverb-wait" name="wait" />
		</div>
		<button id="setReverb-confirm" name="confirm">Confirm</button>
		<button id="setReverb-cancel" name="cancel">Cancel</button>
	</div>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
