<template>
	<!-- Open设置窗口 -->
	<WindowFrame id="setting">
		<TitleBar id="setting-title"
			>Setting<maximize />
			<close />
		</TitleBar>
		<content-frame>
			<grid-box id="setting-grid">
				<text id="setting-title-server" class="setting-title">Server</text>
				<text /><NumberBox id="setting-server-port" min="0" max="65535" />
				<text /><CheckBox id="setting-server-auto" class="standard" />
				<text id="setting-title-apkbuild" class="setting-title">APK Build</text>
				<text /><TextBox id="setting-apkbuild-outputDir" /> <text />
				<TextBox id="setting-apkbuild-newApkPath" /> <text />
				<TextBox id="setting-apkbuild-apktoolPath" />
				<text id="setting-title-signed" class="setting-title">签名配置</text>
				<text /><TextBox id="setting-signed-jksPath" /> <text />
				<TextBox id="setting-signed-keyStorePassword" /> <text />
				<TextBox id="setting-signed-keyAlias" /> <text />
				<TextBox id="setting-signed-keyPassword" /> <text />
				<TextBox id="setting-signed-apksignerPath" /> <text />
				<TextBox id="setting-signed-zipalignPath" /> <text />
				<TextBox id="setting-signed-signedApkPath" />
				<text id="setting-title-other" class="setting-title">other</text>
				<text />
				<CheckBox id="setting-other-copyAsTextKeepEmptyLine" class="standard" />
				<text /><SelectBox id="setting-other-browserSearchHistoryLimit" />
				<text id="setting-title-recent" class="setting-title"></text>
				<text id="setting-recent-statsMode-label" />
				<SelectBox id="setting-recent-statsMode" />
				<text id="setting-title-github" class="setting-title">GitHub</text>
				<text /><SelectBox id="setting-github-accelerationNode" />
				<text id="setting-title-update" class="setting-title"></text>
				<text id="setting-update-checkOnStart-label" />
				<CheckBox id="setting-update-checkOnStart" class="standard" />
			</grid-box>
			<button id="setting-confirm" name="confirm">Confirm</button>
			<button id="setting-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CheckBox from '@app/components/common/CheckBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
