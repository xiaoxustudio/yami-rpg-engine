<template>
	<!-- 设置文本 - 属性 -->
	<WindowFrame id="setText-property">
		<template #title><TitleBar>{{ t('components.setText-property.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.setText-property-key.label') }}</div><SelectBox id="setText-property-key" v-model="form.key" />
				<div class="text">{{ t('components.setText-property-content.label') }}</div
				><TextAreaVar
					id="setText-property-content"
					menu="tag-local-var tag-global-var tag-dynamic-global-var tag-localization"
					v-model="form.content"
				/>
				<div class="text">{{ t('components.setText-property-size.label') }}</div
				><NumberBox id="setText-property-size" min="10" max="400" unit="px" v-model="form.size" />
				<div class="text">{{ t('components.setText-property-lineSpacing.label') }}</div
				><NumberBox
					id="setText-property-lineSpacing"
					min="-10"
					max="100"
					unit="px"
					v-model="form.lineSpacing"
				/>
				<div class="text">{{ t('components.setText-property-letterSpacing.label') }}</div
				><NumberBox
					id="setText-property-letterSpacing"
					min="-10"
					max="100"
					unit="px"
					v-model="form.letterSpacing"
				/>
				<div class="text">{{ t('components.setText-property-color.label') }}</div><ColorBox id="setText-property-color" v-model="form.color" /> <div class="text">{{ t('components.setText-property-font.label') }}</div
				><TextBox id="setText-property-font" v-model="form.font" /> <div class="text">{{ t('components.setText-property-effect-type.label') }}</div
				><SelectBox id="setText-property-effect-type" v-model="form['effect-type']" /> <div class="text">{{ t('components.setText-property-effect-shadowOffsetX.label') }}</div
				><NumberBox
					id="setText-property-effect-shadowOffsetX"
					min="-9"
					max="9"
					unit="px"
					v-model="form['effect-shadowOffsetX']"
				/>
				<div class="text">{{ t('components.setText-property-effect-shadowOffsetY.label') }}</div
				><NumberBox
					id="setText-property-effect-shadowOffsetY"
					min="-9"
					max="9"
					unit="px"
					v-model="form['effect-shadowOffsetY']"
				/>
				<div class="text">{{ t('components.setText-property-effect-strokeWidth.label') }}</div
				><NumberBox
					id="setText-property-effect-strokeWidth"
					min="1"
					max="20"
					unit="px"
					v-model="form['effect-strokeWidth']"
				/>
				<div class="text">{{ t('components.setText-property-effect-color.label') }}</div><ColorBox id="setText-property-effect-color" v-model="form['effect-color']" />
				<div class="text">{{ t('components.setText-property-blend.label') }}</div><SelectBox id="setText-property-blend" v-model="form.blend" />
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
import { TextProperty } from '@app/commands/property-window/set-text-property-window';

const { t } = useI18n();

const form = TextProperty.form;

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {


});
</script>
