<template>
	<WindowFrame id="object-folder">
		<template #title
			><TitleBar
				>{{ t('components.object-folder.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.object-folder-tilemap.label') }}</div>
			<TextBox id="object-folder-tilemap" v-model="ObjectFolder.form.tilemap" />
			<div class="text">{{ t('components.object-folder-actor.label') }}</div>
			<TextBox id="object-folder-actor" v-model="ObjectFolder.form.actor" />
			<div class="text">{{ t('components.object-folder-region.label') }}</div>
			<TextBox id="object-folder-region" v-model="ObjectFolder.form.region" />
			<div class="text">{{ t('components.object-folder-light.label') }}</div>
			<TextBox id="object-folder-light" v-model="ObjectFolder.form.light" />
			<div class="text">{{ t('components.object-folder-animation.label') }}</div>
			<TextBox id="object-folder-animation" v-model="ObjectFolder.form.animation" />
			<div class="text">{{ t('components.object-folder-particle.label') }}</div>
			<TextBox id="object-folder-particle" v-model="ObjectFolder.form.particle" />
			<div class="text">{{ t('components.object-folder-parallax.label') }}</div>
			<TextBox id="object-folder-parallax" v-model="ObjectFolder.form.parallax" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ObjectFolder } from '@app/scene/default-object-folder.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();
</script>

<style>
/* 窗口样式迁移：由 Project/css/ui.css 迁入组件（选择器为全局 id，不能用 scoped） */
#object-folder {
	width: 324px;
	height: 242px;
}

#object-folder-confirm {
	right: 108px;
	bottom: 10px;
}

#object-folder-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

