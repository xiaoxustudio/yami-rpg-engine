<template>
	<NavBar id="layout-nav">
		<PaletteNode value="project" source="tab">
			<div class="nav-item" value="project">
				<div class="nav-icon">&#xf07b;</div>
				<div class="nav-text" id="nav-project">
					{{ t('components.nav-project.content') }}
				</div>
			</div>
		</PaletteNode>
		<PaletteNode value="scene" source="tab">
			<div class="nav-item" value="scene">
				<div class="nav-icon">&#xf26c;</div>
				<div class="nav-text" id="nav-scene">
					{{ t('components.nav-scene.content') }}
				</div>
			</div>
		</PaletteNode>
		<PaletteNode value="scene-object" source="tab">
			<div class="nav-item" value="scene-object">
				<div class="nav-icon">&#xf1b2;</div>
				<div class="nav-text" id="nav-scene-object">
					{{ t('components.nav-scene-object.content') }}
				</div>
			</div>
		</PaletteNode>
		<PaletteNode value="ui" source="tab">
			<div class="nav-item" value="ui">
				<div class="nav-icon">&#xf26c;</div>
				<div class="nav-text" id="nav-ui">
					{{ t('components.nav-ui.content') }}
				</div>
			</div>
		</PaletteNode>
		<PaletteNode value="ui-element" source="tab">
			<div class="nav-item" value="ui-element">
				<div class="nav-icon">&#xf1b2;</div>
				<div class="nav-text" id="nav-ui-element">
					{{ t('components.nav-ui-element.content') }}
				</div>
			</div>
		</PaletteNode>
		<PaletteNode value="animation" source="tab">
			<div class="nav-item" value="animation">
				<div class="nav-icon">&#xf26c;</div>
				<div class="nav-text" id="nav-animation">
					{{ t('components.nav-animation.content') }}
				</div>
			</div>
		</PaletteNode>
		<PaletteNode value="animation-motion" source="tab">
			<div class="nav-item" value="animation-motion">
				<div class="nav-icon">&#xf1b2;</div>
				<div class="nav-text" id="nav-animation-motion">
					{{ t('components.nav-animation-motion.content') }}
				</div>
			</div>
		</PaletteNode>
		<PaletteNode value="animation-timeline" source="tab">
			<div class="nav-item" value="animation-timeline">
				<div class="nav-icon">&#xf017;</div>
				<div class="nav-text" id="nav-animation-timeline">
					{{ t('components.nav-animation-timeline.content') }}
				</div>
			</div>
		</PaletteNode>
		<PaletteNode value="animation-easing" source="tab">
			<div class="nav-item" value="animation-easing">
				<div class="nav-icon">&#xf201;</div>
				<div class="nav-text" id="nav-animation-easing">
					{{ t('components.nav-animation-easing.content') }}
				</div>
			</div>
		</PaletteNode>
		<PaletteNode value="particle" source="tab">
			<div class="nav-item" value="particle">
				<div class="nav-icon">&#xf26c;</div>
				<div class="nav-text" id="nav-particle">
					{{ t('components.nav-particle.content') }}
				</div>
			</div>
		</PaletteNode>
		<PaletteNode value="particle-layer" source="tab">
			<div class="nav-item" value="particle-layer">
				<div class="nav-icon">&#xf1b2;</div>
				<div class="nav-text" id="nav-particle-layer">
					{{ t('components.nav-particle-layer.content') }}
				</div>
			</div>
		</PaletteNode>
		<PaletteNode value="inspector" source="tab">
			<div class="nav-item" value="inspector">
				<div class="nav-icon">&#xf05a;</div>
				<div class="nav-text" id="nav-inspector">
					{{ t('components.nav-inspector.content') }}
				</div>
			</div>
		</PaletteNode>
	</NavBar>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import NavBar from '@app/components/common/NavBar.vue';
import PaletteNode from '@app/components/layout/PaletteNode.vue';

const { t } = useI18n();
</script>
