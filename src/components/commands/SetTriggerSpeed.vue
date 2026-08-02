<template>
	<WindowFrame id="setTriggerSpeed">
		<TitleBar>Set Trigger Speed<div class="close" /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Trigger</text
				><CustomBox id="setTriggerSpeed-trigger" type="trigger" /> <text>Speed</text
				><NumberVar
					id="setTriggerSpeed-speed"
					min="0"
					max="512"
					decimals="4"
					unit="t/s"
				 />
			</grid-box>
			<button id="setTriggerSpeed-confirm" name="confirm">Confirm</button>
			<button id="setTriggerSpeed-cancel" name="cancel">Cancel</button>
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

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
