<template>
	<WindowFrame id="moveCamera">
		<TitleBar>Move Camera<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Mode</text><SelectBox id="moveCamera-mode" /> <text>Position</text
				><CustomBox id="moveCamera-position" type="position" /> <text>Actor</text
				><CustomBox id="moveCamera-actor" type="actor" /> <text>Easing</text
				><SelectBox id="moveCamera-easingId" name="easing" /> <text>Duration</text
				><NumberBox
					id="moveCamera-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				 />
				<text>Wait</text><SelectBox id="moveCamera-wait" name="wait" />
			</div>
			<button id="moveCamera-confirm" name="confirm">Confirm</button>
			<button id="moveCamera-cancel" name="cancel">Cancel</button>
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
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
