<template>
	<DetailBox
		id="uiElement-transform-group"
		:ref="registryRef(inspectorEls, 'uiElement-transform-group')"
		open
	>
		<DetailSummary>{{
			t('components.uiElement-transform-grid.label') || 'Transform'
		}}</DetailSummary>
		<div class="detail-grid" id="uiElement-transform-grid">
			<div class="text">
				{{ t('components.uiElement-transform-align-box.label') || 'Align' }}
			</div>
			<div class="flex-box" id="uiElement-transform-align-box">
				<button
					id="uiElement-transform-align-left"
					v-tip="t('components.uiElement-transform-align-left.tip')"
					class="uiElement-transform-align"
					value="left"
				>
					<div class="text">&#xf036;</div>
				</button>
				<button
					id="uiElement-transform-align-center"
					v-tip="t('components.uiElement-transform-align-center.tip')"
					class="uiElement-transform-align"
					value="center"
				>
					<div class="text">&#xf037;</div>
				</button>
				<button
					id="uiElement-transform-align-right"
					v-tip="t('components.uiElement-transform-align-right.tip')"
					class="uiElement-transform-align"
					value="right"
				>
					<div class="text">&#xf038;</div>
				</button>
				<button
					id="uiElement-transform-align-top"
					v-tip="t('components.uiElement-transform-align-top.tip')"
					class="uiElement-transform-align rotated"
					value="top"
				>
					<div class="text">&#xf036;</div>
				</button>
				<button
					id="uiElement-transform-align-middle"
					v-tip="t('components.uiElement-transform-align-middle.tip')"
					class="uiElement-transform-align rotated"
					value="middle"
				>
					<div class="text">&#xf037;</div>
				</button>
				<button
					id="uiElement-transform-align-bottom"
					v-tip="t('components.uiElement-transform-align-bottom.tip')"
					class="uiElement-transform-align rotated"
					value="bottom"
				>
					<div class="text">&#xf038;</div>
				</button>
			</div>
			<div class="text">
				{{ t('components.uiElement-transform-anchor-box.label') || 'Anchor' }}
			</div>
			<div id="uiElement-transform-anchor-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="uiElement-transform-anchorX"
					v-tip="t('components.uiElement-transform-anchorX.tip')"
					:ref="registryRef(inspectorEls, 'uiElement-transform-anchorX')"
					v-model="form.anchorX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-anchorY"
					v-tip="t('components.uiElement-transform-anchorY.tip')"
					:ref="registryRef(inspectorEls, 'uiElement-transform-anchorY')"
					v-model="form.anchorY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiElement-transform-x-box.label') || 'X' }}</div>
			<div id="uiElement-transform-x-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="uiElement-transform-x"
					v-tip="t('components.uiElement-transform-x.tip')"
					:ref="registryRef(inspectorEls, 'uiElement-transform-x')"
					v-model="form.x"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-x2"
					v-tip="t('components.uiElement-transform-x2.tip')"
					:ref="registryRef(inspectorEls, 'uiElement-transform-x2')"
					v-model="form.x2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiElement-transform-y-box.label') || 'Y' }}</div>
			<div id="uiElement-transform-y-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="uiElement-transform-y"
					v-tip="t('components.uiElement-transform-y.tip')"
					:ref="registryRef(inspectorEls, 'uiElement-transform-y')"
					v-model="form.y"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-y2"
					v-tip="t('components.uiElement-transform-y2.tip')"
					:ref="registryRef(inspectorEls, 'uiElement-transform-y2')"
					v-model="form.y2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiElement-transform-width-box.label') || 'Width' }}
			</div>
			<div id="uiElement-transform-width-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="uiElement-transform-width"
					:ref="registryRef(inspectorEls, 'uiElement-transform-width')"
					v-tip="t('components.uiElement-transform-width.tip')"
					v-model="form.width"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-width2"
					:ref="registryRef(inspectorEls, 'uiElement-transform-width2')"
					v-tip="t('components.uiElement-transform-width2.tip')"
					v-model="form.width2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiElement-transform-height-box.label') || 'Height' }}
			</div>
			<div id="uiElement-transform-height-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="uiElement-transform-height"
					:ref="registryRef(inspectorEls, 'uiElement-transform-height')"
					v-tip="t('components.uiElement-transform-height.tip')"
					v-model="form.height"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-height2"
					:ref="registryRef(inspectorEls, 'uiElement-transform-height2')"
					v-tip="t('components.uiElement-transform-height2.tip')"
					v-model="form.height2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiElement-transform-rotation-box.label') || 'Rotation' }}
			</div>
			<div
				id="uiElement-transform-rotation-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="uiElement-transform-rotation"
					:ref="registryRef(inspectorEls, 'uiElement-transform-rotation')"
					v-tip="t('components.uiElement-transform-rotation.tip')"
					v-model="form.rotation"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiElement-transform-scale-box.label') || 'Scale' }}
			</div>
			<div id="uiElement-transform-scale-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="uiElement-transform-scaleX"
					:ref="registryRef(inspectorEls, 'uiElement-transform-scaleX')"
					v-tip="t('components.uiElement-transform-scaleX.tip')"
					v-model="form.scaleX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-scaleY"
					:ref="registryRef(inspectorEls, 'uiElement-transform-scaleY')"
					v-tip="t('components.uiElement-transform-scaleY.tip')"
					v-model="form.scaleY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiElement-transform-skew-box.label') || 'Skew' }}
			</div>
			<div id="uiElement-transform-skew-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="uiElement-transform-skewX"
					:ref="registryRef(inspectorEls, 'uiElement-transform-skewX')"
					v-tip="t('components.uiElement-transform-skewX.tip')"
					v-model="form.skewX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiElement-transform-skewY"
					:ref="registryRef(inspectorEls, 'uiElement-transform-skewY')"
					v-tip="t('components.uiElement-transform-skewY.tip')"
					v-model="form.skewY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiElement-transform-opacity-box.label') || 'Opacity' }}
			</div>
			<div id="uiElement-transform-opacity-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="uiElement-transform-opacity"
					:ref="registryRef(inspectorEls, 'uiElement-transform-opacity')"
					v-tip="t('components.uiElement-transform-opacity.tip')"
					v-model="form.opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryRef } from '@app/utils/element-registry';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import { uiImageContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(uiImageContextKey)!;
</script>
