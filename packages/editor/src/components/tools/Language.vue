<template>
	<WindowFrame id="language" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.language.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.language-name.label') }}</div>
			<SelectBox
				id="language-name"
				:ref="registryRef(composableEls, 'language-name')"
				v-tip="t('components.language-name.tip')"
				v-focus
			/>
			<div class="text">{{ t('components.language-font.label') }}</div>
			<CustomBox
				id="language-font"
				:ref="registryRef(composableEls, 'language-font')"
				v-tip="t('components.language-font.tip')"
				type="file"
				filter="font"
			/>
			<div class="text">{{ t('components.language-scale.label') }}</div>
			<NumberBox
				:label="t('components.language-scale.label')"
				id="language-scale"
				:ref="registryRef(composableEls, 'language-scale')"
				v-tip="t('components.language-scale.tip')"
				min="0.5"
				max="2"
				decimals="10"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { composableEls } from '@app/composables/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { useProjectSettingsWindow } from '@app/composables/useProjectSettingsWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const settings = useProjectSettingsWindow();

// 确认按钮由 WindowFrame → YMFormButtons 生成（模板里没有、注册表取不到）→ 由 SFC 的 @confirm 驱动
const onConfirm = () => {
	settings.languages.confirm();
};

onMounted(() => {});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#language {
	width: 324px;
	height: 146px;
}

#language-confirm {
	right: 108px;
	bottom: 10px;
}

#language-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
