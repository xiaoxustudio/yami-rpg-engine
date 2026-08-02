<template>
<WindowFrame id="setReverb">
	<TitleBar>Set Reverb<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Type</text><SelectBox id="setReverb-type" /> <text>Dry</text
			><NumberVar id="setReverb-dry" min="0" max="1" step="0.1" decimals="4" />
			<text>Wet</text
			><NumberVar id="setReverb-wet" min="0" max="1" step="0.1" decimals="4" />
			<text>Easing</text><SelectBox id="setReverb-easingId" name="easing" />
			<text>Duration</text
			><NumberBox
				id="setReverb-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
			 />
			<text>Wait</text><SelectBox id="setReverb-wait" name="wait" />
		</grid-box>
		<button id="setReverb-confirm" name="confirm">Confirm</button>
		<button id="setReverb-cancel" name="cancel">Cancel</button>
	</content-frame>
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
