<template>
<window-frame id="setItem">
	<title-bar>Set Item<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Item</text><custom-box id="setItem-item" type="item" />
			<text>Operation</text><select-box id="setItem-operation" />
			<text>Quantity</text><number-var id="setItem-quantity" min="1" max="10000" />
		</grid-box>
		<button id="setItem-confirm" name="confirm">Confirm</button>
		<button id="setItem-cancel" name="cancel">Cancel</button>
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
