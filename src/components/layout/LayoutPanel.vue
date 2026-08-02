<template>
	<PageManager id="workspace-page-manager">
		<page-frame id="home" value="home">
			<box id="home-content">
				<text id="home-title">YAMI RPG EDITOR (Open Yami)</text>
				<text id="home-version"></text>
				<box id="home-start-list">
					<item id="home-start-label" class="home-list-label">Start</item>
					<item id="home-start-new" class="home-start-item" value="new">New Project</item>
					<item id="home-start-open" class="home-start-item" value="open">Open Project</item>
				</box>
				<box id="home-recent-list" tabindex="-1">
					<item id="home-recent-label" class="home-list-label">Recent</item>
					<item class="home-recent-item" value="0"></item>
					<item class="home-recent-item" value="1"></item>
					<item class="home-recent-item" value="2"></item>
				</box>
			</box>
		</page-frame>
		<page-frame value="directory">
			<box id="layout-content">
				<NavBar id="layout-nav">
			<nav-item value="project"><nav-icon>&#xf07b;</nav-icon><nav-text id="nav-project">Project</nav-text></nav-item>
			<nav-item value="scene"><nav-icon>&#xf26c;</nav-icon><nav-text id="nav-scene">Scene</nav-text></nav-item>
			<nav-item value="scene-object"><nav-icon>&#xf1b2;</nav-icon><nav-text id="nav-scene-object">Object</nav-text></nav-item>
			<nav-item value="ui"><nav-icon>&#xf26c;</nav-icon><nav-text id="nav-ui">UI</nav-text></nav-item>
			<nav-item value="ui-element"><nav-icon>&#xf1b2;</nav-icon><nav-text id="nav-ui-element">Element</nav-text></nav-item>
			<nav-item value="animation"><nav-icon>&#xf26c;</nav-icon><nav-text id="nav-animation">Animation</nav-text></nav-item>
			<nav-item value="animation-motion"><nav-icon>&#xf1b2;</nav-icon><nav-text id="nav-animation-motion">Motion</nav-text></nav-item>
			<nav-item value="animation-timeline"><nav-icon>&#xf017;</nav-icon><nav-text id="nav-animation-timeline">Timeline</nav-text></nav-item>
			<nav-item value="animation-easing"><nav-icon>&#xf201;</nav-icon><nav-text id="nav-animation-easing">Easing</nav-text></nav-item>
			<nav-item value="particle"><nav-icon>&#xf26c;</nav-icon><nav-text id="nav-particle">Particle</nav-text></nav-item>
			<nav-item value="particle-layer"><nav-icon>&#xf1b2;</nav-icon><nav-text id="nav-particle-layer">Layer</nav-text></nav-item>
			<nav-item value="inspector"><nav-icon>&#xf05a;</nav-icon><nav-text id="nav-inspector">Inspector</nav-text></nav-item>
		</NavBar>
		<PageManager id="layout-page-manager">
			<page-frame id="project" value="project">
				<file-browser id="project-browser"></file-browser>
			</page-frame>
			<page-frame id="scene" value="scene">
				<box id="scene-head">
					<box id="scene-head-start">
						<item id="scene-switch-grid" class="toolbar-item" value="grid"></item>
						<item id="scene-switch-light" class="toolbar-item" value="light"></item>
						<item id="scene-switch-animation" class="toolbar-item" value="animation"></item>
						<item id="scene-switch-settings" class="toolbar-item" value="settings" hotkey="Alt+S"></item>
					</box>
					<box id="scene-head-center">
						<box id="scene-layer">
							<item id="scene-layer-object" class="toolbar-item" value="object" hotkey="`"></item>
							<item id="scene-layer-tilemap-1" class="toolbar-item hidden" value="1" hotkey="1"></item>
							<item id="scene-layer-tilemap-2" class="toolbar-item hidden" value="2" hotkey="2"></item>
							<item id="scene-layer-tilemap-3" class="toolbar-item hidden" value="3" hotkey="3"></item>
							<item id="scene-layer-tilemap-4" class="toolbar-item hidden" value="4" hotkey="4"></item>
							<item id="scene-layer-tilemap-5" class="toolbar-item hidden" value="5" hotkey="5"></item>
							<item id="scene-layer-tilemap-6" class="toolbar-item hidden" value="6" hotkey="6"></item>
							<item id="scene-layer-terrain" class="toolbar-item" value="terrain" hotkey="`"></item>
						</box>
						<box id="scene-brush">
							<item id="scene-brush-eraser" class="toolbar-item" value="eraser" hotkey="Q"></item>
							<item id="scene-brush-pencil" class="toolbar-item" value="pencil" hotkey="E"></item>
							<item id="scene-brush-rect" class="toolbar-item" value="rect" hotkey="R"></item>
							<item id="scene-brush-oval" class="toolbar-item" value="oval" hotkey="T"></item>
							<item id="scene-brush-fill" class="toolbar-item" value="fill" hotkey="Y"></item>
						</box>
					</box>
					<box id="scene-head-end">
						<slider-box id="scene-zoom" name="zoom" min="0" max="4" hotkey="-/+" active-wheel></slider-box>
					</box>
				</box>
				<box id="scene-body">
					<box id="scene-screen" tabindex="-1">
						<MarqueeArea id="scene-marquee"></MarqueeArea>
					</box>
					<text id="scene-info"></text>
				</box>
			</page-frame>
			<page-frame id="scene-object" value="scene-object">
				<box id="scene-list-head">
					<text-box id="scene-searcher" name="search"></text-box>
				</box>
				<node-list id="scene-list" padded></node-list>
			</page-frame>
			<page-frame id="ui" value="ui">
				<box id="ui-head">
					<box id="ui-head-start">
						<item id="ui-switch-settings" class="toolbar-item" value="settings"></item>
					</box>
					<box id="ui-head-center">
						<item id="ui-element-image" class="toolbar-item" value="image"></item>
						<item id="ui-element-text" class="toolbar-item" value="text"></item>
						<item id="ui-element-textbox" class="toolbar-item" value="textbox"></item>
						<item id="ui-element-dialogbox" class="toolbar-item" value="dialogbox"></item>
						<item id="ui-element-progressbar" class="toolbar-item" value="progressbar"></item>
						<item id="ui-element-button" class="toolbar-item" value="button"></item>
						<item id="ui-element-animation" class="toolbar-item" value="animation"></item>
						<item id="ui-element-video" class="toolbar-item" value="video"></item>
						<item id="ui-element-window" class="toolbar-item" value="window"></item>
						<item id="ui-element-container" class="toolbar-item" value="container"></item>
						<item id="ui-element-reference" class="toolbar-item" value="reference"></item>
					</box>
					<box id="ui-head-end">
						<slider-box id="ui-zoom" name="zoom" min="0" max="4" hotkey="-/+" active-wheel></slider-box>
					</box>
				</box>
				<box id="ui-body">
					<box id="ui-screen" tabindex="-1">
						<MarqueeArea id="ui-marquee"></MarqueeArea>
					</box>
				</box>
			</page-frame>
			<page-frame id="ui-element" value="ui-element">
				<box id="ui-list-head">
					<text-box id="ui-searcher" name="search"></text-box>
				</box>
				<node-list id="ui-list" padded></node-list>
			</page-frame>
			<page-frame id="animation" value="animation">
				<box id="animation-head">
					<box id="animation-head-start">
						<item id="animation-switch-mark" class="toolbar-item" value="mark"></item>
						<item id="animation-switch-onionskin" class="toolbar-item" value="onionskin" hotkey="O"></item>
						<item id="animation-switch-mirror" class="toolbar-item" value="mirror" hotkey="M"></item>
						<item id="animation-switch-settings" class="toolbar-item" value="settings"></item>
					</box>
					<box id="animation-head-center">
						<number-box id="animation-speed" min="0" max="4" step="0.05" decimals="2"><text class="label">speed:</text></number-box>
					</box>
					<box id="animation-head-end">
						<slider-box id="animation-zoom" name="zoom-0-6" min="0" max="6" hotkey="-/+" active-wheel></slider-box>
					</box>
				</box>
				<box id="animation-body">
					<box id="animation-screen" tabindex="-1">
						<MarqueeArea id="animation-marquee"></MarqueeArea>
					</box>
					<box id="animation-dirList"></box>
				</box>
			</page-frame>
			<page-frame id="animation-motion" value="animation-motion">
				<box id="animation-list-head">
					<text-box id="animation-searcher" name="search"></text-box>
				</box>
				<node-list id="animation-list" padded></node-list>
			</page-frame>
			<page-frame id="animation-timeline" value="animation-timeline">
				<box id="animation-timeline-head">
					<box id="animation-timeline-toolbar">
						<item id="animation-timeline-previousKey" class="toolbar-item" value="previousKey" hotkey="Z"></item>
						<item id="animation-timeline-previous" class="toolbar-item" value="previous" hotkey="Q"></item>
						<item id="animation-timeline-play" class="toolbar-item" value="play" hotkey="R"></item>
						<item id="animation-timeline-next" class="toolbar-item" value="next" hotkey="E"></item>
						<item id="animation-timeline-nextKey" class="toolbar-item" value="nextKey" hotkey="X"></item>
						<item id="animation-timeline-loop" class="toolbar-item" value="loop"></item>
					</box>
					<box id="animation-timeline-ruler-outer">
						<box id="animation-timeline-ruler-inner"></box>
					</box>
				</box>
				<node-list id="animation-layer-list"></node-list>
				<box id="animation-timeline-list-outer" tabindex="0">
					<box id="animation-timeline-list-inner"></box>
					<box id="animation-timeline-cursor"></box>
					<box id="animation-timeline-marquee"></box>
					<box id="animation-timeline-marquee-shift"></box>
				</box>
				<box id="animation-timeline-pointer-area-outer">
					<box id="animation-timeline-pointer-area-inner">
						<box id="animation-timeline-pointer"></box>
					</box>
				</box>
			</page-frame>
			<page-frame id="animation-easing" value="animation-easing">
				<box id="animation-easing-head">
					<item id="animation-easing-settings" class="toolbar-item" value="bezier"></item>
					<select-box id="animation-easing-id"></select-box>
				</box>
				<canvas id="animation-easing-canvas" width="0" height="0"></canvas>
			</page-frame>
			<page-frame id="particle" value="particle">
				<box id="particle-head">
					<box id="particle-head-start">
						<item id="particle-view-wireframe" class="toolbar-item" value="wireframe"></item>
						<item id="particle-view-anchor" class="toolbar-item" value="anchor"></item>
					</box>
					<box id="particle-head-center">
						<box id="particle-control">
							<item id="particle-control-restart" class="toolbar-item" value="restart" hotkey="R"></item>
							<item id="particle-control-pause" class="toolbar-item" value="pause" hotkey="P"></item>
						</box>
						<number-box id="particle-speed" min="0" max="4" step="0.05" decimals="2"><text class="label">speed:</text></number-box>
					</box>
					<box id="particle-head-end">
						<slider-box id="particle-zoom" name="zoom" min="0" max="4" hotkey="-/+" active-wheel></slider-box>
					</box>
				</box>
				<box id="particle-body">
					<box id="particle-screen" tabindex="-1">
						<MarqueeArea id="particle-marquee"></MarqueeArea>
					</box>
					<text id="particle-info"></text>
				</box>
			</page-frame>
			<page-frame id="particle-layer" value="particle-layer">
				<node-list id="particle-list" padded></node-list>
			</page-frame>
			<page-frame id="inspector" value="inspector">
				<PageManager id="inspector-page-manager" tabindex="-1">
					<page-frame value="fileScene" id="fileScene-vue-mount"></page-frame>
					<page-frame value="fileUI" id="fileUI-vue-mount"></page-frame>
					<page-frame value="fileAnimation" id="fileAnimation-vue-mount"></page-frame>
					<page-frame id="fileTileset" value="fileTileset"></page-frame>
					<page-frame value="fileActor" id="fileActor-vue-mount"></page-frame>
					<page-frame value="fileSkill" id="fileSkill-vue-mount"></page-frame>
					<page-frame value="fileTrigger" id="fileTrigger-vue-mount"></page-frame>
					<page-frame value="fileItem" id="fileItem-vue-mount"></page-frame>
					<page-frame value="fileEquipment" id="fileEquipment-vue-mount"></page-frame>
					<page-frame value="fileState" id="fileState-vue-mount"></page-frame>
					<page-frame value="fileEvent" id="fileEvent-vue-mount"></page-frame>
					<page-frame id="fileImage" value="fileImage"></page-frame>
					<page-frame id="fileAudio" value="fileAudio"></page-frame>
					<page-frame id="fileVideo" value="fileVideo"></page-frame>
					<page-frame id="fileFont" value="fileFont"></page-frame>
					<page-frame id="fileScript" value="fileScript"></page-frame>
					<page-frame value="sceneActor" id="sceneActor-vue-mount"></page-frame>
					<page-frame value="sceneRegion" id="sceneRegion-vue-mount"></page-frame>
					<page-frame value="sceneLight" id="sceneLight-vue-mount"></page-frame>
					<page-frame value="sceneAnimation" id="sceneAnimation-vue-mount"></page-frame>
					<page-frame value="sceneParticle" id="sceneParticle-vue-mount"></page-frame>
					<page-frame value="sceneParallax" id="sceneParallax-vue-mount"></page-frame>
					<page-frame value="sceneTilemap" id="sceneTilemap-vue-mount"></page-frame>
					<page-frame value="uiImage" id="uiImage-vue-mount"></page-frame>
					<page-frame value="uiText" id="uiText-vue-mount"></page-frame>
					<page-frame value="uiTextBox" id="uiTextBox-vue-mount"></page-frame>
					<page-frame value="uiDialogBox" id="uiDialogBox-vue-mount"></page-frame>
					<page-frame value="uiProgressBar" id="uiProgressBar-vue-mount"></page-frame>
					<page-frame value="uiButton" id="uiButton-vue-mount"></page-frame>
					<page-frame value="uiAnimation" id="uiAnimation-vue-mount"></page-frame>
					<page-frame value="uiVideo" id="uiVideo-vue-mount"></page-frame>
					<page-frame value="uiWindow" id="uiWindow-vue-mount"></page-frame>
					<page-frame value="uiContainer"></page-frame>
					<page-frame value="uiReference" id="uiReference-vue-mount"></page-frame>
					<page-frame value="animMotion" id="animMotion-vue-mount"></page-frame>
					<page-frame value="animJointFrame" id="animJointFrame-vue-mount"></page-frame>
					<page-frame value="animSpriteLayer" id="animSpriteLayer-vue-mount"></page-frame>
					<page-frame value="animSpriteFrame" id="animSpriteFrame-vue-mount"></page-frame>
					<page-frame value="animParticleLayer" id="animParticleLayer-vue-mount"></page-frame>
					<page-frame value="animParticleFrame" id="animParticleFrame-vue-mount"></page-frame>
					<page-frame value="animSoundLayer" id="animSoundLayer-vue-mount"></page-frame>
					<page-frame value="animSoundFrame" id="animSoundFrame-vue-mount"></page-frame>
					<page-frame value="particleLayer" id="particleLayer-vue-mount"></page-frame>
					</PageManager>
			</page-frame>
		</PageManager>
</box>
</page-frame>
	<page-frame value="scene"></page-frame>
	<page-frame value="ui"></page-frame>
	<page-frame value="animation"></page-frame>
	<page-frame value="particle"></page-frame>
	</PageManager>
</template>

<script setup lang="ts">
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import PageManager from '@app/components/common/PageManager.vue';
import NavBar from '@app/components/common/NavBar.vue';
</script>
