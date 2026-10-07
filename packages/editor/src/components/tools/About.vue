<template>
	<WindowFrame id="about" no-buttons>
		<template #title
			><TitleBar
				>{{ t('components.about.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text" id="about-credits">{{ t('components.about-credits.content') }}</div>
			<!-- 超链接点击由本组件转发（Menubar.initialize 不再全文档查 `.href`） -->
			<div class="text" @click="onHrefClick">
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
			<div
				class="text"
				id="editor-version"
				:ref="registryRef(titleEls, 'editor-version')"
			></div>
			<div class="text">Electron</div>
			<div
				class="text"
				id="electron-version"
				:ref="registryRef(titleEls, 'electron-version')"
			></div>
			<div class="text">Chromium</div>
			<div
				class="text"
				id="chrome-version"
				:ref="registryRef(titleEls, 'chrome-version')"
			></div>
			<div class="text">Node.js</div>
			<div class="text" id="node-version" :ref="registryRef(titleEls, 'node-version')"></div>
			<div class="text">V8</div>
			<div class="text" id="v8-version" :ref="registryRef(titleEls, 'v8-version')"></div>
			<div class="text">OS</div>
			<div class="text" id="os-version" :ref="registryRef(titleEls, 'os-version')"></div>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Menubar } from '@app/title/menu-bar.ts';
import { titleEls } from '@app/title/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';

const { t } = useI18n();

const onHrefClick = (event: MouseEvent): void => {
	Menubar.hrefClick!(event);
};

onMounted(() => {});
</script>

<style>
#about {
	width: 280px;
	height: 400px;
	border: 5px solid transparent;
	border-image-slice: 1;
	animation: neon-border-animation 3s linear infinite;
}
</style>
