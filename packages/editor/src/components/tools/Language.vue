<template>
	<WindowFrame id="language">
		<template #title
			><TitleBar
				>{{ t('components.language.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.language-name.label') }}</div>
			<SelectBox id="language-name" v-focus />
			<div class="text">{{ t('components.language-font.label') }}</div>
			<CustomBox id="language-font" type="file" filter="font" />
			<div class="text">{{ t('components.language-scale.label') }}</div>
			<NumberBox id="language-scale" min="0.5" max="2" decimals="10" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

onMounted(() => {});
</script>
