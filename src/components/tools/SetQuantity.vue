<template>
	<!-- 设置数量窗口 -->
	<window-frame id="setQuantity">
		<title-bar>Set Quantity<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Quantity</text><number-box id="setQuantity-quantity" min="1" />
			</grid-box>
			<button id="setQuantity-confirm" name="confirm">Confirm</button>
			<button id="setQuantity-cancel" name="cancel">Cancel</button>
		</content-frame>
	</window-frame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
