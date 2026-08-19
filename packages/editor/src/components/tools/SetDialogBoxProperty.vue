<template>
		<WindowFrame id="setDialogBox-property">
		<template #title><TitleBar>{{ t('components.setDialogBox-property.title') }}<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.setDialogBox-property-key.label') }}</div><SelectBox id="setDialogBox-property-key" />
				<div class="text">{{ t('components.setDialogBox-property-content.label') }}</div
				><TextAreaVar
					id="setDialogBox-property-content"
					menu="tag-local-var tag-global-var tag-localization"
				/>
				<div class="text">{{ t('components.setDialogBox-property-interval.label') }}</div
				><NumberBox
					id="setDialogBox-property-interval"
					min="0"
					max="100"
					unit="ms"
				/>
				<div class="text">{{ t('components.setDialogBox-property-size.label') }}</div
				><NumberBox id="setDialogBox-property-size" min="10" max="400" unit="px" />
				<div class="text">{{ t('components.setDialogBox-property-lineSpacing.label') }}</div
				><NumberBox
					id="setDialogBox-property-lineSpacing"
					min="-10"
					max="100"
					unit="px"
				/>
				<div class="text">{{ t('components.setDialogBox-property-letterSpacing.label') }}</div
				><NumberBox
					id="setDialogBox-property-letterSpacing"
					min="-10"
					max="100"
					unit="px"
				/>
				<div class="text">{{ t('components.setDialogBox-property-color.label') }}</div><ColorBox id="setDialogBox-property-color" />
				<div class="text">{{ t('components.setDialogBox-property-font.label') }}</div><TextBox id="setDialogBox-property-font" />
				<div class="text">{{ t('components.setDialogBox-property-effect-type.label') }}</div><SelectBox id="setDialogBox-property-effect-type" />
				<div class="text">{{ t('components.setDialogBox-property-effect-shadowOffsetX.label') }}</div
				><NumberBox
					id="setDialogBox-property-effect-shadowOffsetX"
					min="-9"
					max="9"
					unit="px"
				/>
				<div class="text">{{ t('components.setDialogBox-property-effect-shadowOffsetY.label') }}</div
				><NumberBox
					id="setDialogBox-property-effect-shadowOffsetY"
					min="-9"
					max="9"
					unit="px"
				/>
				<div class="text">{{ t('components.setDialogBox-property-effect-strokeWidth.label') }}</div
				><NumberBox
					id="setDialogBox-property-effect-strokeWidth"
					min="1"
					max="20"
					unit="px"
				/>
				<div class="text">{{ t('components.setDialogBox-property-effect-color.label') }}</div><ColorBox id="setDialogBox-property-effect-color" />
				<div class="text">{{ t('components.setDialogBox-property-blend.label') }}</div><SelectBox id="setDialogBox-property-blend" />
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
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextAreaVar from '@app/components/common/TextAreaVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {


});
</script>
