<template>
	<WindowFrame id="about" no-buttons>
		<template #title
			><TitleBar
				>{{ t('components.about.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text" id="about-credits">{{ t('components.about-credits.content') }}</div>
			<div class="text">
				<div class="text href">刀里个刀</div>
				<br />
				<div
					class="text href"
					href="https://store.steampowered.com/app/2346410/Border_Pioneer"
				>
					Yahzj
				</div>
				<br />
				<div class="text href" href="https://github.com/chunqian">Chunqian</div>
				<br />
				<div class="text href" href="https://github.com/xiaoxustudio">徐然先生</div>
				<br />
				<div class="text href">Alias</div>
				<br />
				<div class="text href" href="https://www.youtube.com/watch?v=3VcWWYIzKNY">
					Mr. Von Grimmsy
				</div>
				<br />
				<div class="text href" href="https://vk.com/sxdmedia">ZerosmO</div>
				<br />
				<div class="text href">SmoLife</div>
				<br />
				<div class="text href" href="https://twitter.com/DavisCorsac">Davis Corsac</div>
				<br />
			</div>
			<div class="text">Editor</div>
			<div class="text" id="editor-version"></div>
			<div class="text">Electron</div>
			<div class="text" id="electron-version"></div>
			<div class="text">Chromium</div>
			<div class="text" id="chrome-version"></div>
			<div class="text">Node.js</div>
			<div class="text" id="node-version"></div>
			<div class="text">V8</div>
			<div class="text" id="v8-version"></div>
			<div class="text">OS</div>
			<div class="text" id="os-version"></div>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';

const { t } = useI18n();

onMounted(() => {});
</script>

<style>
/* 窗口样式迁移：由 Project/css/dialogs.css 迁入组件（选择器为全局 id，不能用 scoped） */
#about {
	width: 280px;
	height: 400px;
	border: 5px solid transparent;
	border-image-slice: 1;
	animation: neon-border-animation 3s linear infinite;
}
</style>

