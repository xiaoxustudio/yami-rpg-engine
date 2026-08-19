<template>
	<!-- 设置视频 - 属性 -->
	<WindowFrame id="setVideo-property">
		<template #title><TitleBar>{{ t('components.setVideo-property.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.setVideo-property-key.label') }}</div><SelectBox id="setVideo-property-key" />
				<div class="text">{{ t('components.setVideo-property-video.label') }}</div
				><CustomBox id="setVideo-property-video" type="file" filter="video" />
				<div class="text">{{ t('components.setVideo-property-playbackRate.label') }}</div
				><NumberVar
					id="setVideo-property-playbackRate"
					min="0"
					max="4"
					decimals="4"
				/>
				<div class="text">{{ t('components.setVideo-property-loop.label') }}</div><SelectBox id="setVideo-property-loop" /> <div class="text">{{ t('components.setVideo-property-flip.label') }}</div
				><SelectBox id="setVideo-property-flip" /> <div class="text">{{ t('components.setVideo-property-blend.label') }}</div
				><SelectBox id="setVideo-property-blend" />
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
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {


});
</script>
