<template>
	<WindowFrame id="fileAnimation-sprite" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.fileAnimation-sprite.title') }}<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.fileAnimation-sprite-name.label') }}</div><TextBox id="fileAnimation-sprite-name" /> <div class="text">{{ t('components.fileAnimation-sprite-image.label') }}</div
				><CustomBox id="fileAnimation-sprite-image" type="file" filter="image" />
				<div class="text">{{ t('components.fileAnimation-sprite-hframes.label') }}</div
				><NumberBox id="fileAnimation-sprite-hframes" min="1" max="256" />
				<div class="text">{{ t('components.fileAnimation-sprite-vframes.label') }}</div
				><NumberBox id="fileAnimation-sprite-vframes" min="1" max="256" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Inspector?.fileAnimation?.sprites?.save?.();
};

onMounted(() => {


});
</script>
