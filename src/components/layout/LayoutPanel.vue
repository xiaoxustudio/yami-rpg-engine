<template>
	<PageManager id="workspace-page-manager">
		<div class="page-frame" id="home" value="home">
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
		</div>
		<div class="page-frame" value="directory">
			<box id="layout-content">
				<NavBar id="layout-nav">
			<div class="nav-item" value="project"><div class="nav-icon">&#xf07b;</div><div class="nav-text" id="nav-project">Project</div></div>
			<div class="nav-item" value="scene"><div class="nav-icon">&#xf26c;</div><div class="nav-text" id="nav-scene">Scene</div></div>
			<div class="nav-item" value="scene-object"><div class="nav-icon">&#xf1b2;</div><div class="nav-text" id="nav-scene-object">Object</div></div>
			<div class="nav-item" value="ui"><div class="nav-icon">&#xf26c;</div><div class="nav-text" id="nav-ui">UI</div></div>
			<div class="nav-item" value="ui-element"><div class="nav-icon">&#xf1b2;</div><div class="nav-text" id="nav-ui-element">Element</div></div>
			<div class="nav-item" value="animation"><div class="nav-icon">&#xf26c;</div><div class="nav-text" id="nav-animation">Animation</div></div>
			<div class="nav-item" value="animation-motion"><div class="nav-icon">&#xf1b2;</div><div class="nav-text" id="nav-animation-motion">Motion</div></div>
			<div class="nav-item" value="animation-timeline"><div class="nav-icon">&#xf017;</div><div class="nav-text" id="nav-animation-timeline">Timeline</div></div>
			<div class="nav-item" value="animation-easing"><div class="nav-icon">&#xf201;</div><div class="nav-text" id="nav-animation-easing">Easing</div></div>
			<div class="nav-item" value="particle"><div class="nav-icon">&#xf26c;</div><div class="nav-text" id="nav-particle">Particle</div></div>
			<div class="nav-item" value="particle-layer"><div class="nav-icon">&#xf1b2;</div><div class="nav-text" id="nav-particle-layer">Layer</div></div>
			<div class="nav-item" value="inspector"><div class="nav-icon">&#xf05a;</div><div class="nav-text" id="nav-inspector">Inspector</div></div>
		</NavBar>
		<PageManager id="layout-page-manager">
			<div class="page-frame" id="project" value="project">
				<div class="file-browser" id="project-browser"></div>
			</div>
			<div class="page-frame" id="scene" value="scene">
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
						<SliderBox id="scene-zoom" name="zoom" min="0" max="4" hotkey="-/+" active-wheel></SliderBox>
					</box>
				</box>
				<box id="scene-body">
					<box id="scene-screen" tabindex="-1">
						<MarqueeArea id="scene-marquee"></MarqueeArea>
					</box>
					<text id="scene-info"></text>
				</box>
			</div>
			<div class="page-frame" id="scene-object" value="scene-object">
				<box id="scene-list-head">
					<TextBox id="scene-searcher" name="search"></TextBox>
				</box>
				<TreeList id="scene-list" padded></TreeList>
			</div>
			<div class="page-frame" id="ui" value="ui">
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
						<SliderBox id="ui-zoom" name="zoom" min="0" max="4" hotkey="-/+" active-wheel></SliderBox>
					</box>
				</box>
				<box id="ui-body">
					<box id="ui-screen" tabindex="-1">
						<MarqueeArea id="ui-marquee"></MarqueeArea>
					</box>
				</box>
			</div>
			<div class="page-frame" id="ui-element" value="ui-element">
				<box id="ui-list-head">
					<TextBox id="ui-searcher" name="search"></TextBox>
				</box>
				<TreeList id="ui-list" padded></TreeList>
			</div>
			<div class="page-frame" id="animation" value="animation">
				<box id="animation-head">
					<box id="animation-head-start">
						<item id="animation-switch-mark" class="toolbar-item" value="mark"></item>
						<item id="animation-switch-onionskin" class="toolbar-item" value="onionskin" hotkey="O"></item>
						<item id="animation-switch-mirror" class="toolbar-item" value="mirror" hotkey="M"></item>
						<item id="animation-switch-settings" class="toolbar-item" value="settings"></item>
					</box>
					<box id="animation-head-center">
						<NumberBox id="animation-speed" min="0" max="4" step="0.05" decimals="2"><text class="label">speed:</text></NumberBox>
					</box>
					<box id="animation-head-end">
						<SliderBox id="animation-zoom" name="zoom-0-6" min="0" max="6" hotkey="-/+" active-wheel></SliderBox>
					</box>
				</box>
				<box id="animation-body">
					<box id="animation-screen" tabindex="-1">
						<MarqueeArea id="animation-marquee"></MarqueeArea>
					</box>
					<box id="animation-dirList"></box>
				</box>
			</div>
			<div class="page-frame" id="animation-motion" value="animation-motion">
				<box id="animation-list-head">
					<TextBox id="animation-searcher" name="search"></TextBox>
				</box>
				<TreeList id="animation-list" padded></TreeList>
			</div>
			<div class="page-frame" id="animation-timeline" value="animation-timeline">
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
				<TreeList id="animation-layer-list"></TreeList>
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
			</div>
			<div class="page-frame" id="animation-easing" value="animation-easing">
				<box id="animation-easing-head">
					<item id="animation-easing-settings" class="toolbar-item" value="bezier"></item>
					<SelectBox id="animation-easing-id"></SelectBox>
				</box>
				<canvas id="animation-easing-canvas" width="0" height="0"></canvas>
			</div>
			<div class="page-frame" id="particle" value="particle">
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
						<NumberBox id="particle-speed" min="0" max="4" step="0.05" decimals="2"><text class="label">speed:</text></NumberBox>
					</box>
					<box id="particle-head-end">
						<SliderBox id="particle-zoom" name="zoom" min="0" max="4" hotkey="-/+" active-wheel></SliderBox>
					</box>
				</box>
				<box id="particle-body">
					<box id="particle-screen" tabindex="-1">
						<MarqueeArea id="particle-marquee"></MarqueeArea>
					</box>
					<text id="particle-info"></text>
				</box>
			</div>
			<div class="page-frame" id="particle-layer" value="particle-layer">
				<TreeList id="particle-list" padded></TreeList>
			</div>
			<div class="page-frame" id="inspector" value="inspector">
				<PageManager id="inspector-page-manager" tabindex="-1">
					<div class="page-frame" value="fileScene" id="fileScene-vue-mount"></div>
					<div class="page-frame" value="fileUI" id="fileUI-vue-mount"></div>
					<div class="page-frame" value="fileAnimation" id="fileAnimation-vue-mount"></div>
					<div class="page-frame" id="fileTileset" value="fileTileset"></div>
					<div class="page-frame" value="fileActor" id="fileActor-vue-mount"></div>
					<div class="page-frame" value="fileSkill" id="fileSkill-vue-mount"></div>
					<div class="page-frame" value="fileTrigger" id="fileTrigger-vue-mount"></div>
					<div class="page-frame" value="fileItem" id="fileItem-vue-mount"></div>
					<div class="page-frame" value="fileEquipment" id="fileEquipment-vue-mount"></div>
					<div class="page-frame" value="fileState" id="fileState-vue-mount"></div>
					<div class="page-frame" value="fileEvent" id="fileEvent-vue-mount"></div>
					<div class="page-frame" id="fileImage" value="fileImage"></div>
					<div class="page-frame" id="fileAudio" value="fileAudio"></div>
					<div class="page-frame" id="fileVideo" value="fileVideo"></div>
					<div class="page-frame" id="fileFont" value="fileFont"></div>
					<div class="page-frame" id="fileScript" value="fileScript"></div>
					<div class="page-frame" value="sceneActor" id="sceneActor-vue-mount"></div>
					<div class="page-frame" value="sceneRegion" id="sceneRegion-vue-mount"></div>
					<div class="page-frame" value="sceneLight" id="sceneLight-vue-mount"></div>
					<div class="page-frame" value="sceneAnimation" id="sceneAnimation-vue-mount"></div>
					<div class="page-frame" value="sceneParticle" id="sceneParticle-vue-mount"></div>
					<div class="page-frame" value="sceneParallax" id="sceneParallax-vue-mount"></div>
					<div class="page-frame" value="sceneTilemap" id="sceneTilemap-vue-mount"></div>
					<div class="page-frame" value="uiImage" id="uiImage-vue-mount"></div>
					<div class="page-frame" value="uiText" id="uiText-vue-mount"></div>
					<div class="page-frame" value="uiTextBox" id="uiTextBox-vue-mount"></div>
					<div class="page-frame" value="uiDialogBox" id="uiDialogBox-vue-mount"></div>
					<div class="page-frame" value="uiProgressBar" id="uiProgressBar-vue-mount"></div>
					<div class="page-frame" value="uiButton" id="uiButton-vue-mount"></div>
					<div class="page-frame" value="uiAnimation" id="uiAnimation-vue-mount"></div>
					<div class="page-frame" value="uiVideo" id="uiVideo-vue-mount"></div>
					<div class="page-frame" value="uiWindow" id="uiWindow-vue-mount"></div>
					<div class="page-frame" value="uiContainer"></div>
					<div class="page-frame" value="uiReference" id="uiReference-vue-mount"></div>
					<div class="page-frame" value="animMotion" id="animMotion-vue-mount"></div>
					<div class="page-frame" value="animJointFrame" id="animJointFrame-vue-mount"></div>
					<div class="page-frame" value="animSpriteLayer" id="animSpriteLayer-vue-mount"></div>
					<div class="page-frame" value="animSpriteFrame" id="animSpriteFrame-vue-mount"></div>
					<div class="page-frame" value="animParticleLayer" id="animParticleLayer-vue-mount"></div>
					<div class="page-frame" value="animParticleFrame" id="animParticleFrame-vue-mount"></div>
					<div class="page-frame" value="animSoundLayer" id="animSoundLayer-vue-mount"></div>
					<div class="page-frame" value="animSoundFrame" id="animSoundFrame-vue-mount"></div>
					<div class="page-frame" value="particleLayer" id="particleLayer-vue-mount"></div>
					</PageManager>
			</div>
		</PageManager>
</box>
</div>
	<div class="page-frame" value="scene"></div>
	<div class="page-frame" value="ui"></div>
	<div class="page-frame" value="animation"></div>
	<div class="page-frame" value="particle"></div>
	</PageManager>
</template>

<script setup lang="ts">
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import PageManager from '@app/components/common/PageManager.vue';
import NavBar from '@app/components/common/NavBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
</script>
