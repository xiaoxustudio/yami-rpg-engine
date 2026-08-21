<template>
		<WindowFrame id="setButton-property">
		<template #title><TitleBar>{{ t('components.setButton-property.title') }}<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.setButton-property-key.label') }}</div><SelectBox id="setButton-property-key" v-model="form.key" />
				<div class="text">{{ t('components.setButton-property-image.label') }}</div
				><CustomBox id="setButton-property-image" type="file" filter="image" v-model="form.image" />
				<div class="text">{{ t('components.setButton-property-clip-box.label') }}</div>
				<div id="setButton-property-clip-box" class="box uiElement-grid-box with-4-columns">
					<NumberBox id="setButton-property-clip-0" min="0" max="10000" v-model="form['clip-0']" />
					<NumberBox id="setButton-property-clip-1" min="0" max="10000" v-model="form['clip-1']" />
					<NumberBox id="setButton-property-clip-2" min="0" max="4000" v-model="form['clip-2']" />
					<NumberBox id="setButton-property-clip-3" min="0" max="4000" v-model="form['clip-3']" />
				</div>
				<div class="text">{{ t('components.setButton-property-tint-box.label') }}</div>
				<div id="setButton-property-tint-box" class="box uiElement-grid-box with-4-columns">
					<NumberBox
						id="setButton-property-tint-0"
						min="-255"
						max="255"
						step="5"
						v-model="form['tint-0']"
					/>
					<NumberBox
						id="setButton-property-tint-1"
						min="-255"
						max="255"
						step="5"
						v-model="form['tint-1']"
					/>
					<NumberBox
						id="setButton-property-tint-2"
						min="-255"
						max="255"
						step="5"
						v-model="form['tint-2']"
					/>
					<NumberBox id="setButton-property-tint-3" min="0" max="255" step="5" v-model="form['tint-3']" />
				</div>
				<div class="text">{{ t('components.setButton-property-imageOpacity.label') }}</div
				><NumberBox
					id="setButton-property-imageOpacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
					v-model="form.imageOpacity"
				/>
				<div class="text">{{ t('components.setButton-property-content.label') }}</div
				><TextAreaVar
					id="setButton-property-content"
					menu="tag-local-var tag-global-var tag-dynamic-global-var tag-localization"
					v-model="form.content"
				/>
				<div class="text">{{ t('components.setButton-property-size.label') }}</div
				><NumberBox id="setButton-property-size" min="10" max="400" unit="px" v-model="form.size" />
				<div class="text">{{ t('components.setButton-property-letterSpacing.label') }}</div
				><NumberBox
					id="setButton-property-letterSpacing"
					min="-10"
					max="100"
					unit="px"
					v-model="form.letterSpacing"
				/>
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
import NumberBox from '@app/components/common/NumberBox.vue';
import TextAreaVar from '@app/components/common/TextAreaVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { ButtonProperty } from '@app/commands/property-window/set-button-property-window';

const { t } = useI18n();

const form = ButtonProperty.form;

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {


});
</script>
