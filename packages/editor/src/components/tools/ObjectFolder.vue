<template>
		<WindowFrame id="object-folder">
		<template #title><TitleBar>{{ t('components.object-folder.title') }}<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.object-folder-tilemap.label') }}</div><TextBox id="object-folder-tilemap" /> <div class="text">{{ t('components.object-folder-actor.label') }}</div
				><TextBox id="object-folder-actor" /> <div class="text">{{ t('components.object-folder-region.label') }}</div
				><TextBox id="object-folder-region" /> <div class="text">{{ t('components.object-folder-light.label') }}</div
				><TextBox id="object-folder-light" /> <div class="text">{{ t('components.object-folder-animation.label') }}</div
				><TextBox id="object-folder-animation" /> <div class="text">{{ t('components.object-folder-particle.label') }}</div
				><TextBox id="object-folder-particle" /> <div class="text">{{ t('components.object-folder-parallax.label') }}</div
				><TextBox id="object-folder-parallax" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {


});
</script>
