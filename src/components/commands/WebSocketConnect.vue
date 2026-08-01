<template>
	<window-frame id="webSocketConnect">
		<title-bar>webSocketConnect<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>URL</text><string-var id="webSocketConnect-url" /> <text>ID</text
				><string-var id="webSocketConnect-id" /> <text>Protocols</text
				><string-var id="webSocketConnect-protocols" /> <text>OnOpen</text
				><custom-box id="webSocketConnect-onOpen" type="file" filter="event" />
				<text>OnMessage</text
				><custom-box id="webSocketConnect-onMessage" type="file" filter="event" />
				<text>OnError</text
				><custom-box id="webSocketConnect-onError" type="file" filter="event" />
				<text>OnClose</text
				><custom-box id="webSocketConnect-onClose" type="file" filter="event" />
			</grid-box>
			<button id="webSocketConnect-confirm" name="confirm">Confirm</button>
			<button id="webSocketConnect-cancel" name="cancel">Cancel</button>
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
