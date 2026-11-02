<template>
	<WindowFrame id="about" no-buttons>
		<template #title
			><TitleBar
				>{{ t('components.about.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text" id="about-credits">{{ t('components.about-credits.content') }}</div>

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
			<div class="text" id="editor-version" :ref="controlRef('editor-version')"></div>
			<div class="text">Electron</div>
			<div class="text" id="electron-version" :ref="controlRef('electron-version')"></div>
			<div class="text">Chromium</div>
			<div class="text" id="chrome-version" :ref="controlRef('chrome-version')"></div>
			<div class="text">Node.js</div>
			<div class="text" id="node-version" :ref="controlRef('node-version')"></div>
			<div class="text">V8</div>
			<div class="text" id="v8-version" :ref="controlRef('v8-version')"></div>
			<div class="text">OS</div>
			<div class="text" id="os-version" :ref="controlRef('os-version')"></div>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Menubar } from '@app/title/menu-bar.ts';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'chrome-version'
	| 'editor-version'
	| 'electron-version'
	| 'node-version'
	| 'os-version'
	| 'v8-version';

const { controlRef } = useControlRefs<Id>();

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
