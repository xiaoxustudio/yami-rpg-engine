<template>
	<WindowFrame id="setTriggerDuration">
		<TitleBar>Set Trigger Duration<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Trigger</div
				><CustomBox id="setTriggerDuration-trigger" type="trigger" />
				<div class="text">Operation</div><SelectBox id="setTriggerDuration-operation" />
				<div class="text">Duration</div
				><NumberVar
					id="setTriggerDuration-duration"
					min="0"
					max="3600000"
					unit="ms"
				 />
			</div>
			<button id="setTriggerDuration-confirm" name="confirm">Confirm</button>
			<button id="setTriggerDuration-cancel" name="cancel">Cancel</button>
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
