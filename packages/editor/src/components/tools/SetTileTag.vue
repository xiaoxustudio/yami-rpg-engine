<template>
	<WindowFrame id="setTileTag">
		<template #title
			><TitleBar
				>{{ t('components.setTileTag.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setTileTag-tag.label') }}</div>
			<NumberBox id="setTileTag-tag" min="0" max="99999" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const { t } = useI18n();

onMounted(() => {});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setTileTag {
	width: 324px;
	height: 98px;
}

#setTileTag-confirm {
	right: 108px;
	bottom: 10px;
}

#setTileTag-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
