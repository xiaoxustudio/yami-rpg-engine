<template>
	<WindowFrame id="webSocketConnect">
		<TitleBar>webSocketConnect<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>URL</text><StringVar id="webSocketConnect-url" /> <text>ID</text
				><StringVar id="webSocketConnect-id" /> <text>Protocols</text
				><StringVar id="webSocketConnect-protocols" /> <text>OnOpen</text
				><CustomBox id="webSocketConnect-onOpen" type="file" filter="event" />
				<text>OnMessage</text
				><CustomBox id="webSocketConnect-onMessage" type="file" filter="event" />
				<text>OnError</text
				><CustomBox id="webSocketConnect-onError" type="file" filter="event" />
				<text>OnClose</text
				><CustomBox id="webSocketConnect-onClose" type="file" filter="event" />
			</div>
			<button id="webSocketConnect-confirm" name="confirm">Confirm</button>
			<button id="webSocketConnect-cancel" name="cancel">Cancel</button>
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
import StringVar from '@app/components/common/StringVar.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
