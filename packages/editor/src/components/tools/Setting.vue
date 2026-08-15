<template>
	<!-- Open设置窗口 -->
	<WindowFrame id="setting">
		<template #title><TitleBar id="setting-title"
			>Setting<div class="maximize" />
			<div class="close" />
		</TitleBar></template>
		
			<div class="grid-box" id="setting-grid">
				<div class="text setting-title" id="setting-title-server">Server</div>
				<div class="text" /><NumberBox id="setting-server-port" min="0" max="65535" />
				<div class="text" /><CheckBox id="setting-server-auto" class="standard" />
				<div class="text setting-title" id="setting-title-apkbuild">APK Build</div>
				<div class="text" /><TextBox id="setting-apkbuild-outputDir" /> <div class="text" />
				<TextBox id="setting-apkbuild-newApkPath" /> <div class="text" />
				<TextBox id="setting-apkbuild-apktoolPath" />
				<div class="text setting-title" id="setting-title-signed">签名配置</div>
				<div class="text" /><TextBox id="setting-signed-jksPath" /> <div class="text" />
				<TextBox id="setting-signed-keyStorePassword" /> <div class="text" />
				<TextBox id="setting-signed-keyAlias" /> <div class="text" />
				<TextBox id="setting-signed-keyPassword" /> <div class="text" />
				<TextBox id="setting-signed-apksignerPath" /> <div class="text" />
				<TextBox id="setting-signed-zipalignPath" /> <div class="text" />
				<TextBox id="setting-signed-signedApkPath" />
				<div class="text setting-title" id="setting-title-other">other</div>
				<div class="text" />
				<CheckBox id="setting-other-copyAsTextKeepEmptyLine" class="standard" />
				<div class="text" /><SelectBox id="setting-other-browserSearchHistoryLimit" />
				<div class="text setting-title" id="setting-title-recent"></div>
				<div class="text" id="setting-recent-statsMode-label" />
				<SelectBox id="setting-recent-statsMode" />
				<div class="text setting-title" id="setting-title-github">GitHub</div>
				<div class="text" /><SelectBox id="setting-github-accelerationNode" />
				<div class="text setting-title" id="setting-title-update"></div>
				<div class="text" id="setting-update-checkOnStart-label" />
				<CheckBox id="setting-update-checkOnStart" class="standard" />
			</div>
		
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


});
</script>
