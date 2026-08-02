<template>
	<!-- 公告窗口 -->
	<WindowFrame id="update-log">
		<TitleBar>Update Log<close /></TitleBar>
		<content-frame>
			<box id="update-log-tabs">
				<button id="update-log-tab-internal" class="update-log-tab active">Origin</button>
				<button id="update-log-tab-community" class="update-log-tab">Community</button>
				<button id="update-log-tab-donation" class="update-log-tab">捐赠名单</button>
			</box>
			<box id="update-log-container">
				<box id="update-log-content" />
			</box>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
