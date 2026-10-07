<template>
	<WindowFrame id="export-apk" :ref="registryRef(titleEls, 'export-apk')" no-buttons>
		<template #title
			><TitleBar
				>构建APK
				<div class="close"></div></TitleBar
		></template>

		<div class="box" id="export-apk-out">
			<div class="grid-box" id="export-apk-grid">
				<div class="text project-summary">应用配置</div>
				<div class="text">应用名称</div>
				<TextBox
					:label="'应用名称'"
					id="export-apk-apkName"
					v-model="exportApkForm.apkName"
				/>
				<div class="text">应用图标</div>
				<TextBox
					:label="'应用图标'"
					id="export-apk-apkIcon"
					:ref="registryRef(titleEls, 'export-apk-apkIcon')"
					v-model="exportApkForm.apkIcon"
				/>
				<div class="text">应用包名</div>
				<TextBox
					:label="'应用包名'"
					id="export-apk-apkPackageName"
					v-model="exportApkForm.apkPackageName"
				/>
				<div class="text">应用版本</div>
				<TextBox
					:label="'应用版本'"
					id="export-apk-apkVersionName"
					v-model="exportApkForm.apkVersionName"
				/>
				<div class="text">应用版本号</div>
				<TextBox
					:label="'应用版本号'"
					id="export-apk-apkVersionCode"
					v-model="exportApkForm.apkVersionCode"
				/>
			</div>

			<div class="box" id="export-apk-PS" @click="onHrefClick">
				<div class="text project-summary export-apk-major">PS（温馨提示）</div>
				<div class="text export-apk-major">
					构建前请确保您安装了Java，apktool（内置）、apksigner（内置）、zipalign（内置）工具
				</div>
				<div class="text export-apk-major">
					构建前请确保您的项目路径不包含中文、且.preview文件夹存在(ctrl+s保存可快速创建)
				</div>
				<div class="text export-apk-major">
					模板包无内置Taptap和生命周期，因此（移动端-API.指令）插件的部分功能无法使用，如需使用请自行构建
					<div
						class="text href"
						href="https://github.com/Open-Yami-Community/yamiexample"
					>
						示例项目
					</div>
				</div>
				<div class="text export-apk-major">
					@表示编辑器模板目录、$表示项目目录apk文件夹、~表示项目目录
				</div>
			</div>
			<div class="box" id="export-apk-container" ref="elContainer">
				<div class="box" id="export-apk-content" ref="elContent">
					<div v-for="(log, index) in items" :key="index" class="export-apk-major text">
						{{ log.msg }}
					</div>
				</div>
			</div>
		</div>
		<button
			id="export-apk-button"
			:ref="registryRef(titleEls, 'export-apk-button')"
			name="export-to-apk"
		/>
	</WindowFrame>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import { moduleEls } from '@app/module/element-registry';
import { titleEls } from '@app/title/element-registry';
import { registryRef, registerElement } from '@app/utils/element-registry';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import { ApkBuilder } from '@app/module/apkbuilder.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import { exportApkForm, Menubar } from '@app/title/menu-bar';

const items = ref<{ done: boolean; msg: string }[]>([]);

const onHrefClick = (event: MouseEvent): void => {
	Menubar.hrefClick!(event);
};

const elContainer = ref<HTMLElement | null>(null);
const elContent = ref<HTMLElement | null>(null);

const update = (): void => {
	items.value = ApkBuilder.logs.slice();
	void nextTick(() => {
		elContainer.value?.scrollTo({
			top: elContainer.value.scrollHeight
		});
	});
};

onMounted(() => {
	registerElement(moduleEls, 'export-apk-content', elContent.value);
	const el = elContent.value;
	if (!el) return;
	attachElementApi(el, { update });
	update();
});
</script>

<style>
#export-apk {
	width: 480px;
	height: 720px;
}

#export-apk-out {
	display: block;
	border: var(--input-border);
	border-radius: 2px;
	overflow-x: hidden;
	overflow-y: auto;
	height: 650px;
	width: 100%;
}

#export-apk-PS {
	display: block;
	overflow-x: hidden;
	overflow-y: auto;
	padding: 10px;
	width: 460px;
	height: 240px;
	margin: 0 auto;
}

#export-apk-container {
	display: block;
	background-color: var(--input-background);
	border: var(--input-border);
	border-radius: 2px;
	overflow-x: hidden;
	overflow-y: auto;
	width: 460px;
	height: 200px;
	margin: 0 auto;
}

#export-apk-content {
	display: block;
	padding: 0 10px;
	white-space: pre-wrap;
	user-select: text;
}

#export-apk-button {
	position: absolute;
	bottom: 10px;
	width: 200px;
	left: 140px;
}
</style>
