<template>
	<WindowFrame id="export-apk" no-buttons>
		<template #title><TitleBar>构建APK<div class="close"></div></TitleBar></template>
		
			<div class="box" id="export-apk-out">
				<div class="grid-box" id="export-apk-grid">
					<div class="text project-summary">应用配置</div>
					<div class="text">应用名称</div><TextBox id="export-apk-apkName" />
					<div class="text">应用图标</div><TextBox id="export-apk-apkIcon" />
					<div class="text">应用包名</div><TextBox id="export-apk-apkPackageName" />
					<div class="text">应用版本</div><TextBox id="export-apk-apkVersionName" />
					<div class="text">应用版本号</div><TextBox id="export-apk-apkVersionCode" />
				</div>
				<div class="box" id="export-apk-PS">
					<div class="text project-summary export-apk-major">PS（温馨提示）</div>
					<div class="text export-apk-major"
						>构建前请确保您安装了Java，apktool（内置）、apksigner（内置）、zipalign（内置）工具</div
					>
					<div class="text export-apk-major"
						>构建前请确保您的项目路径不包含中文、且.preview文件夹存在(ctrl+s保存可快速创建)</div
					>
					<div class="text export-apk-major"
						>模板包无内置Taptap和生命周期，因此（移动端-API.指令）插件的部分功能无法使用，如需使用请自行构建<div class="text href"
							href="https://github.com/Open-Yami-Community/yamiexample"
							>示例项目</div
						></div
					>
					<div class="text export-apk-major"
						>@表示编辑器模板目录、$表示项目目录apk文件夹、~表示项目目录</div
					>
				</div>
				<div class="box" id="export-apk-container">
					<div class="box" id="export-apk-content"> </div>
				</div>
			</div>
			<button id="export-apk-button" name="export-to-apk" />
		
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
