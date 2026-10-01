<template>
	<WindowFrame id="setTileTag" :ref="registryRef(moduleEls, 'setTileTag')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setTileTag.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setTileTag-tag.label') }}</div>
			<NumberBox
				:label="t('components.setTileTag-tag.label')"
				id="setTileTag-tag"
				v-tip="t('components.setTileTag-tag.tip')"
				:ref="registryRef(moduleEls, 'setTileTag-tag')"
				min="0"
				max="99999"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { SetTileTag } from '@app/module/set-tile-tag.ts';
import { onMounted } from 'vue';
import { moduleEls } from '@app/module/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

// setTileTag-confirm 由 WindowFrame 生成，改由 @confirm 驱动
const onConfirm = () => {
	SetTileTag?.confirm?.();
};

const { t } = useI18n();

onMounted(() => {});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
