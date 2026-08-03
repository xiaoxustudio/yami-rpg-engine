<template>
	<!-- 触发器访问器窗口 -->
	<WindowFrame id="triggerGetter">
		<TitleBar>Trigger<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="triggerGetter-type" /> <div class="text">Variable</div
				><CustomBox id="triggerGetter-variable" type="variable" filter="object" />
			</div>
			<button id="triggerGetter-confirm" name="confirm">Confirm</button>
			<button id="triggerGetter-cancel" name="cancel">Cancel</button>
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
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
