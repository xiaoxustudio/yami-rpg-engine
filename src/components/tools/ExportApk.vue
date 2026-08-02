<template>
	<WindowFrame id="export-apk">
		<TitleBar>构建APK<close></close></TitleBar>
		<content-frame>
			<box id="export-apk-out">
				<grid-box id="export-apk-grid">
					<text class="project-summary">应用配置</text>
					<text>应用名称</text><TextBox id="export-apk-apkName" />
					<text>应用图标</text><TextBox id="export-apk-apkIcon" />
					<text>应用包名</text><TextBox id="export-apk-apkPackageName" />
					<text>应用版本</text><TextBox id="export-apk-apkVersionName" />
					<text>应用版本号</text><TextBox id="export-apk-apkVersionCode" />
				</grid-box>
				<box id="export-apk-PS">
					<text class="project-summary export-apk-major">PS（温馨提示）</text>
					<text class="export-apk-major"
						>构建前请确保您安装了Java，apktool（内置）、apksigner（内置）、zipalign（内置）工具</text
					>
					<text class="export-apk-major"
						>构建前请确保您的项目路径不包含中文、且.preview文件夹存在(ctrl+s保存可快速创建)</text
					>
					<text class="export-apk-major"
						>模板包无内置Taptap和生命周期，因此（移动端-API.指令）插件的部分功能无法使用，如需使用请自行构建<text
							class="href"
							href="https://github.com/Open-Yami-Community/yamiexample"
							>示例项目</text
						></text
					>
					<text class="export-apk-major"
						>@表示编辑器模板目录、$表示项目目录apk文件夹、~表示项目目录</text
					>
				</box>
				<box id="export-apk-container">
					<box id="export-apk-content"> </box>
				</box>
			</box>
			<button id="export-apk-button" name="export-to-apk" />
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextBox from '@app/components/common/TextBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
