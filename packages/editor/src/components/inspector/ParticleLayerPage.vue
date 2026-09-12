<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.particleLayer-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="particleLayer-general-grid">
			<div class="text">{{ t('components.particleLayer-name.label') || 'Name' }}</div>
			<TextBox id="particleLayer-name"
				v-tip="t('components.particleLayer-name.tip')" v-model="form.name" @input="onParamInput"></TextBox>
			<div class="text">
				{{ t('components.particleLayer-area-type.label') || 'Emission Area' }}
			</div>
			<SelectBox
				id="particleLayer-area-type"
				v-tip="t('components.particleLayer-area-type.tip')"
				ref="elAreaType"
				v-model="form.area.type"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.particleLayer-area-x.label') || 'X' }}</div>
			<NumberBox
				id="particleLayer-area-x"
				v-tip="t('components.particleLayer-area-x.tip')"
				ref="elAreaX"
				v-model="form.area.x"
				@input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ t('components.particleLayer-area-y.label') || 'Y' }}</div>
			<NumberBox
				id="particleLayer-area-y"
				v-tip="t('components.particleLayer-area-y.tip')"
				ref="elAreaY"
				v-model="form.area.y"
				@input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ t('components.particleLayer-area-width.label') || 'Width' }}</div>
			<NumberBox
				id="particleLayer-area-width"
				v-tip="t('components.particleLayer-area-width.tip')"
				ref="elAreaWidth"
				v-model="form.area.width"
				@input="onParamInput"
				min="0"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">
				{{ t('components.particleLayer-area-height.label') || 'Height' }}
			</div>
			<NumberBox
				id="particleLayer-area-height"
				v-tip="t('components.particleLayer-area-height.tip')"
				ref="elAreaHeight"
				v-model="form.area.height"
				@input="onParamInput"
				min="0"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">
				{{ t('components.particleLayer-area-radius.label') || 'Radius' }}
			</div>
			<NumberBox
				id="particleLayer-area-radius"
				v-tip="t('components.particleLayer-area-radius.tip')"
				ref="elAreaRadius"
				v-model="form.area.radius"
				@input="onParamInput"
				min="0"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">
				{{ t('components.particleLayer-count.label') || 'Emission Count' }}
			</div>
			<NumberBox
				id="particleLayer-count"
				v-tip="t('components.particleLayer-count.tip')"
				v-model="form.count"
				@input="onParamInput"
				min="0"
				max="1000000000"
			></NumberBox>
			<div class="text">
				{{ t('components.particleLayer-delay.label') || 'Initial Delay' }}
			</div>
			<NumberBox
				id="particleLayer-delay"
				v-tip="t('components.particleLayer-delay.tip')"
				v-model="form.delay"
				@input="onParamInput"
				min="0"
				max="1000000000"
				unit="ms"
			></NumberBox>
			<div class="text">{{ t('components.particleLayer-interval.label') || 'Interval' }}</div>
			<NumberBox
				id="particleLayer-interval"
				v-tip="t('components.particleLayer-interval.tip')"
				v-model="form.interval"
				@input="onParamInput"
				min="0"
				max="1000000000"
				unit="ms"
			></NumberBox>
			<div class="text">{{ t('components.particleLayer-lifetime.label') || 'Lifetime' }}</div>
			<NumberBox
				id="particleLayer-lifetime"
				v-tip="t('components.particleLayer-lifetime.tip')"
				v-model="form.lifetime"
				@input="onParamInput"
				min="0"
				max="1000000000"
				unit="ms"
			></NumberBox>
			<div class="text">
				{{ t('components.particleLayer-lifetimeDev.label') || 'Lifetime Dev' }}
			</div>
			<NumberBox
				id="particleLayer-lifetimeDev"
				v-tip="t('components.particleLayer-lifetimeDev.tip')"
				v-model="form.lifetimeDev"
				@input="onParamInput"
				min="0"
				max="1000000000"
				unit="ms"
			></NumberBox>
			<div class="text">{{ t('components.particleLayer-fadeout.label') || 'Fadeout' }}</div>
			<NumberBox
				id="particleLayer-fadeout"
				v-tip="t('components.particleLayer-fadeout.tip')"
				v-model="form.fadeout"
				@input="onParamInput"
				min="0"
				max="1000000000"
				unit="ms"
			></NumberBox>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.particleLayer-anchor-grid.label') || 'Anchor'
		}}</DetailSummary>
		<div class="detail-grid" id="particleLayer-anchor-grid">
			<div class="text">
				{{ t('components.particleLayer-anchor-x-box.label') || 'Anchor X' }}
			</div>
			<div class="flex-box" id="particleLayer-anchor-x-box">
				<NumberBox
					id="particleLayer-anchor-x-0"
				v-tip="t('components.particleLayer-anchor-x-0.tip')"
					v-model="form.anchor.x[0]"
					@input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-anchor-x-1"
				v-tip="t('components.particleLayer-anchor-x-1.tip')"
					v-model="form.anchor.x[1]"
					@input="onParamInput"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-anchor-y-box.label') || 'Anchor Y' }}
			</div>
			<div class="flex-box" id="particleLayer-anchor-y-box">
				<NumberBox
					id="particleLayer-anchor-y-0"
				v-tip="t('components.particleLayer-anchor-y-0.tip')"
					v-model="form.anchor.y[0]"
					@input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-anchor-y-1"
				v-tip="t('components.particleLayer-anchor-y-1.tip')"
					v-model="form.anchor.y[1]"
					@input="onParamInput"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-anchor-speedX-box.label') || 'Anchor Speed X' }}
			</div>
			<div class="flex-box" id="particleLayer-anchor-speedX-box">
				<NumberBox
					id="particleLayer-anchor-speedX-0"
				v-tip="t('components.particleLayer-anchor-speedX-0.tip')"
					v-model="form.anchor.speedX[0]"
					@input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-anchor-speedX-1"
				v-tip="t('components.particleLayer-anchor-speedX-1.tip')"
					v-model="form.anchor.speedX[1]"
					@input="onParamInput"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-anchor-speedY-box.label') || 'Anchor Speed Y' }}
			</div>
			<div class="flex-box" id="particleLayer-anchor-speedY-box">
				<NumberBox
					id="particleLayer-anchor-speedY-0"
				v-tip="t('components.particleLayer-anchor-speedY-0.tip')"
					v-model="form.anchor.speedY[0]"
					@input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-anchor-speedY-1"
				v-tip="t('components.particleLayer-anchor-speedY-1.tip')"
					v-model="form.anchor.speedY[1]"
					@input="onParamInput"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.particleLayer-movement-grid.label') || 'Movement'
		}}</DetailSummary>
		<div class="detail-grid" id="particleLayer-movement-grid">
			<div class="text">
				{{ t('components.particleLayer-movement-angle-box.label') || 'Movement Angle' }}
			</div>
			<div class="flex-box" id="particleLayer-movement-angle-box">
				<NumberBox
					id="particleLayer-movement-angle-0"
				v-tip="t('components.particleLayer-movement-angle-0.tip')"
					v-model="form.movement.angle[0]"
					@input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-movement-angle-1"
				v-tip="t('components.particleLayer-movement-angle-1.tip')"
					v-model="form.movement.angle[1]"
					@input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-movement-speed-box.label') || 'Movement Speed' }}
			</div>
			<div class="flex-box" id="particleLayer-movement-speed-box">
				<NumberBox
					id="particleLayer-movement-speed-0"
				v-tip="t('components.particleLayer-movement-speed-0.tip')"
					v-model="form.movement.speed[0]"
					@input="onParamInput"
					min="-10000"
					max="10000"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-movement-speed-1"
				v-tip="t('components.particleLayer-movement-speed-1.tip')"
					v-model="form.movement.speed[1]"
					@input="onParamInput"
					min="0"
					max="10000"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-movement-accelAngle-box.label') || 'Accel Angle' }}
			</div>
			<div class="flex-box" id="particleLayer-movement-accelAngle-box">
				<NumberBox
					id="particleLayer-movement-accelAngle-0"
				v-tip="t('components.particleLayer-movement-accelAngle-0.tip')"
					v-model="form.movement.accelAngle[0]"
					@input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-movement-accelAngle-1"
				v-tip="t('components.particleLayer-movement-accelAngle-1.tip')"
					v-model="form.movement.accelAngle[1]"
					@input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-movement-accel-box.label') || 'Accel' }}
			</div>
			<div class="flex-box" id="particleLayer-movement-accel-box">
				<NumberBox
					id="particleLayer-movement-accel-0"
				v-tip="t('components.particleLayer-movement-accel-0.tip')"
					v-model="form.movement.accel[0]"
					@input="onParamInput"
					min="-10000"
					max="10000"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-movement-accel-1"
				v-tip="t('components.particleLayer-movement-accel-1.tip')"
					v-model="form.movement.accel[1]"
					@input="onParamInput"
					min="0"
					max="10000"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.particleLayer-rotation-grid.label') || 'Rotation'
		}}</DetailSummary>
		<div class="detail-grid" id="particleLayer-rotation-grid">
			<div class="text">
				{{ t('components.particleLayer-rotation-angle-box.label') || 'Rotation Angle' }}
			</div>
			<div class="flex-box" id="particleLayer-rotation-angle-box">
				<NumberBox
					id="particleLayer-rotation-angle-0"
				v-tip="t('components.particleLayer-rotation-angle-0.tip')"
					v-model="form.rotation.angle[0]"
					@input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-rotation-angle-1"
				v-tip="t('components.particleLayer-rotation-angle-1.tip')"
					v-model="form.rotation.angle[1]"
					@input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-rotation-speed-box.label') || 'Angular Velocity' }}
			</div>
			<div class="flex-box" id="particleLayer-rotation-speed-box">
				<NumberBox
					id="particleLayer-rotation-speed-0"
				v-tip="t('components.particleLayer-rotation-speed-0.tip')"
					v-model="form.rotation.speed[0]"
					@input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-rotation-speed-1"
				v-tip="t('components.particleLayer-rotation-speed-1.tip')"
					v-model="form.rotation.speed[1]"
					@input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-rotation-accel-box.label') || 'Angular Accel' }}
			</div>
			<div class="flex-box" id="particleLayer-rotation-accel-box">
				<NumberBox
					id="particleLayer-rotation-accel-0"
				v-tip="t('components.particleLayer-rotation-accel-0.tip')"
					v-model="form.rotation.accel[0]"
					@input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-rotation-accel-1"
				v-tip="t('components.particleLayer-rotation-accel-1.tip')"
					v-model="form.rotation.accel[1]"
					@input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.particleLayer-hRotation-grid.label') || 'Horizontal Rotation'
		}}</DetailSummary>
		<div class="detail-grid" id="particleLayer-hRotation-grid">
			<div class="text">
				{{ t('components.particleLayer-hRotation-radius-box.label') || 'Initial Radius' }}
			</div>
			<div class="flex-box" id="particleLayer-hRotation-radius-box">
				<NumberBox
					id="particleLayer-hRotation-radius-0"
				v-tip="t('components.particleLayer-hRotation-radius-0.tip')"
					v-model="form.hRotation.radius[0]"
					@input="onParamInput"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-radius-1"
				v-tip="t('components.particleLayer-hRotation-radius-1.tip')"
					v-model="form.hRotation.radius[1]"
					@input="onParamInput"
					min="0"
					max="10000"
					decimals="4"
					unit="px"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{
					t('components.particleLayer-hRotation-expansionSpeed-box.label') ||
					'Expansion Speed'
				}}
			</div>
			<div class="flex-box" id="particleLayer-hRotation-expansionSpeed-box">
				<NumberBox
					id="particleLayer-hRotation-expansionSpeed-0"
				v-tip="t('components.particleLayer-hRotation-expansionSpeed-0.tip')"
					v-model="form.hRotation.expansionSpeed[0]"
					@input="onParamInput"
					min="-10000"
					max="10000"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-expansionSpeed-1"
				v-tip="t('components.particleLayer-hRotation-expansionSpeed-1.tip')"
					v-model="form.hRotation.expansionSpeed[1]"
					@input="onParamInput"
					min="0"
					max="10000"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{
					t('components.particleLayer-hRotation-expansionAccel-box.label') ||
					'Expansion Accel'
				}}
			</div>
			<div class="flex-box" id="particleLayer-hRotation-expansionAccel-box">
				<NumberBox
					id="particleLayer-hRotation-expansionAccel-0"
				v-tip="t('components.particleLayer-hRotation-expansionAccel-0.tip')"
					v-model="form.hRotation.expansionAccel[0]"
					@input="onParamInput"
					min="-10000"
					max="10000"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-expansionAccel-1"
				v-tip="t('components.particleLayer-hRotation-expansionAccel-1.tip')"
					v-model="form.hRotation.expansionAccel[1]"
					@input="onParamInput"
					min="0"
					max="10000"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-hRotation-angle-box.label') || 'Rotation Angle' }}
			</div>
			<div class="flex-box" id="particleLayer-hRotation-angle-box">
				<NumberBox
					id="particleLayer-hRotation-angle-0"
				v-tip="t('components.particleLayer-hRotation-angle-0.tip')"
					v-model="form.hRotation.angle[0]"
					@input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-angle-1"
				v-tip="t('components.particleLayer-hRotation-angle-1.tip')"
					v-model="form.hRotation.angle[1]"
					@input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{
					t('components.particleLayer-hRotation-angularSpeed-box.label') ||
					'Angular Velocity'
				}}
			</div>
			<div class="flex-box" id="particleLayer-hRotation-angularSpeed-box">
				<NumberBox
					id="particleLayer-hRotation-angularSpeed-0"
				v-tip="t('components.particleLayer-hRotation-angularSpeed-0.tip')"
					v-model="form.hRotation.angularSpeed[0]"
					@input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-angularSpeed-1"
				v-tip="t('components.particleLayer-hRotation-angularSpeed-1.tip')"
					v-model="form.hRotation.angularSpeed[1]"
					@input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{
					t('components.particleLayer-hRotation-angularAccel-box.label') ||
					'Angular Accel'
				}}
			</div>
			<div class="flex-box" id="particleLayer-hRotation-angularAccel-box">
				<NumberBox
					id="particleLayer-hRotation-angularAccel-0"
				v-tip="t('components.particleLayer-hRotation-angularAccel-0.tip')"
					v-model="form.hRotation.angularAccel[0]"
					@input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-angularAccel-1"
				v-tip="t('components.particleLayer-hRotation-angularAccel-1.tip')"
					v-model="form.hRotation.angularAccel[1]"
					@input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.particleLayer-scale-grid.label') || 'Scale'
		}}</DetailSummary>
		<div class="detail-grid" id="particleLayer-scale-grid">
			<div class="text">
				{{ t('components.particleLayer-scale-factor-box.label') || 'Scale Factor' }}
			</div>
			<div class="flex-box" id="particleLayer-scale-factor-box">
				<NumberBox
					id="particleLayer-scale-factor-0"
				v-tip="t('components.particleLayer-scale-factor-0.tip')"
					v-model="form.scale.factor[0]"
					@input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-scale-factor-1"
				v-tip="t('components.particleLayer-scale-factor-1.tip')"
					v-model="form.scale.factor[1]"
					@input="onParamInput"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-scale-speed-box.label') || 'Expansion Speed' }}
			</div>
			<div class="flex-box" id="particleLayer-scale-speed-box">
				<NumberBox
					id="particleLayer-scale-speed-0"
				v-tip="t('components.particleLayer-scale-speed-0.tip')"
					v-model="form.scale.speed[0]"
					@input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-scale-speed-1"
				v-tip="t('components.particleLayer-scale-speed-1.tip')"
					v-model="form.scale.speed[1]"
					@input="onParamInput"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-scale-accel-box.label') || 'Expansion Accel' }}
			</div>
			<div class="flex-box" id="particleLayer-scale-accel-box">
				<NumberBox
					id="particleLayer-scale-accel-0"
				v-tip="t('components.particleLayer-scale-accel-0.tip')"
					v-model="form.scale.accel[0]"
					@input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-scale-accel-1"
				v-tip="t('components.particleLayer-scale-accel-1.tip')"
					v-model="form.scale.accel[1]"
					@input="onParamInput"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.particleLayer-rendering-grid.label') || 'Rendering'
		}}</DetailSummary>
		<div class="detail-grid" id="particleLayer-rendering-grid">
			<div class="text">{{ t('components.particleLayer-image.label') || 'Image' }}</div>
			<CustomBox
				id="particleLayer-image"
				v-tip="t('components.particleLayer-image.tip')"
				type="file"
				filter="image"
				:model-value="form.image"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ t('components.particleLayer-blend.label') || 'Blend' }}</div>
			<SelectBox
				id="particleLayer-blend"
				v-tip="t('components.particleLayer-blend.tip')"
				ref="elBlend"
				v-model="form.blend"
				@input="onParamInput"
			></SelectBox>
			<div class="text">
				{{ t('components.particleLayer-light.label') || 'Light Sampling' }}
			</div>
			<SelectBox
				id="particleLayer-light"
				v-tip="t('components.particleLayer-light.tip')"
				ref="elLight"
				v-model="form.light"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.particleLayer-sort.label') || 'Sort' }}</div>
			<SelectBox
				id="particleLayer-sort"
				v-tip="t('components.particleLayer-sort.tip')"
				ref="elSort"
				v-model="form.sort"
				@input="onParamInput"
			></SelectBox>
			<div class="text">
				{{ t('components.particleLayer-sprite-mode.label') || 'Sprite Mode' }}
			</div>
			<SelectBox
				id="particleLayer-sprite-mode"
				v-tip="t('components.particleLayer-sprite-mode.tip')"
				ref="elSpriteMode"
				v-model="form.sprite.mode"
				@input="onParamInput"
			></SelectBox>
			<div class="text">
				{{ t('components.particleLayer-sprite-hframes.label') || 'Horiz Frames' }}
			</div>
			<NumberBox
				id="particleLayer-sprite-hframes"
				v-tip="t('components.particleLayer-sprite-hframes.tip')"
				v-model="form.sprite.hframes"
				@input="onParamInput"
				min="1"
				max="100"
			></NumberBox>
			<div class="text">
				{{ t('components.particleLayer-sprite-vframes.label') || 'Vert Frames' }}
			</div>
			<NumberBox
				id="particleLayer-sprite-vframes"
				v-tip="t('components.particleLayer-sprite-vframes.tip')"
				v-model="form.sprite.vframes"
				@input="onParamInput"
				min="1"
				max="100"
			></NumberBox>
			<div class="text">
				{{ t('components.particleLayer-sprite-interval.label') || 'Animation Interval' }}
			</div>
			<NumberBox
				id="particleLayer-sprite-interval"
				v-tip="t('components.particleLayer-sprite-interval.tip')"
				ref="elSpriteInterval"
				v-model="form.sprite.interval"
				@input="onParamInput"
				min="1"
				max="5000"
				unit="ms"
			></NumberBox>
			<div class="text">
				{{ t('components.particleLayer-color-mode.label') || 'Color Mode' }}
			</div>
			<SelectBox
				id="particleLayer-color-mode"
				v-tip="t('components.particleLayer-color-mode.tip')"
				ref="elColorMode"
				v-model="form.color.mode"
				@input="onParamInput"
			></SelectBox>
			<div class="text">
				{{ t('components.particleLayer-color-rgba-box.label') || 'Color' }}
			</div>
			<div class="flex-box" id="particleLayer-color-rgba-box" ref="elColorRgbaBox">
				<NumberBox
					id="particleLayer-color-rgba-0"
				v-tip="t('components.particleLayer-color-rgba-0.tip')"
					v-model="form.color.rgba[0]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-rgba-1"
				v-tip="t('components.particleLayer-color-rgba-1.tip')"
					v-model="form.color.rgba[1]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-rgba-2"
				v-tip="t('components.particleLayer-color-rgba-2.tip')"
					v-model="form.color.rgba[2]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-rgba-3"
				v-tip="t('components.particleLayer-color-rgba-3.tip')"
					v-model="form.color.rgba[3]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-min-box.label') || 'Color Min' }}
			</div>
			<div class="flex-box" id="particleLayer-color-min-box" ref="elColorMinBox">
				<NumberBox
					id="particleLayer-color-min-0"
				v-tip="t('components.particleLayer-color-min-0.tip')"
					v-model="form.color.min[0]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-min-1"
				v-tip="t('components.particleLayer-color-min-1.tip')"
					v-model="form.color.min[1]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-min-2"
				v-tip="t('components.particleLayer-color-min-2.tip')"
					v-model="form.color.min[2]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-min-3"
				v-tip="t('components.particleLayer-color-min-3.tip')"
					v-model="form.color.min[3]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-max-box.label') || 'Color Max' }}
			</div>
			<div class="flex-box" id="particleLayer-color-max-box" ref="elColorMaxBox">
				<NumberBox
					id="particleLayer-color-max-0"
				v-tip="t('components.particleLayer-color-max-0.tip')"
					v-model="form.color.max[0]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-max-1"
				v-tip="t('components.particleLayer-color-max-1.tip')"
					v-model="form.color.max[1]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-max-2"
				v-tip="t('components.particleLayer-color-max-2.tip')"
					v-model="form.color.max[2]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-max-3"
				v-tip="t('components.particleLayer-color-max-3.tip')"
					v-model="form.color.max[3]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-easingId.label') || 'Color Easing' }}
			</div>
			<SelectBox
				id="particleLayer-color-easingId"
				v-tip="t('components.particleLayer-color-easingId.tip')"
				ref="elColorEasingId"
				v-model="form.color.easingId"
				@input="onParamInput"
			></SelectBox>
			<div class="text">
				{{ t('components.particleLayer-color-startMin-box.label') || 'Color Start Min' }}
			</div>
			<div class="flex-box" id="particleLayer-color-startMin-box" ref="elColorStartMinBox">
				<NumberBox
					id="particleLayer-color-startMin-0"
				v-tip="t('components.particleLayer-color-startMin-0.tip')"
					v-model="form.color.startMin[0]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMin-1"
				v-tip="t('components.particleLayer-color-startMin-1.tip')"
					v-model="form.color.startMin[1]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMin-2"
				v-tip="t('components.particleLayer-color-startMin-2.tip')"
					v-model="form.color.startMin[2]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMin-3"
				v-tip="t('components.particleLayer-color-startMin-3.tip')"
					v-model="form.color.startMin[3]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-startMax-box.label') || 'Color Start Max' }}
			</div>
			<div class="flex-box" id="particleLayer-color-startMax-box" ref="elColorStartMaxBox">
				<NumberBox
					id="particleLayer-color-startMax-0"
				v-tip="t('components.particleLayer-color-startMax-0.tip')"
					v-model="form.color.startMax[0]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMax-1"
				v-tip="t('components.particleLayer-color-startMax-1.tip')"
					v-model="form.color.startMax[1]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMax-2"
				v-tip="t('components.particleLayer-color-startMax-2.tip')"
					v-model="form.color.startMax[2]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMax-3"
				v-tip="t('components.particleLayer-color-startMax-3.tip')"
					v-model="form.color.startMax[3]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-endMin-box.label') || 'Color End Min' }}
			</div>
			<div class="flex-box" id="particleLayer-color-endMin-box" ref="elColorEndMinBox">
				<NumberBox
					id="particleLayer-color-endMin-0"
				v-tip="t('components.particleLayer-color-endMin-0.tip')"
					v-model="form.color.endMin[0]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMin-1"
				v-tip="t('components.particleLayer-color-endMin-1.tip')"
					v-model="form.color.endMin[1]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMin-2"
				v-tip="t('components.particleLayer-color-endMin-2.tip')"
					v-model="form.color.endMin[2]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMin-3"
				v-tip="t('components.particleLayer-color-endMin-3.tip')"
					v-model="form.color.endMin[3]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-endMax-box.label') || 'Color End Max' }}
			</div>
			<div class="flex-box" id="particleLayer-color-endMax-box" ref="elColorEndMaxBox">
				<NumberBox
					id="particleLayer-color-endMax-0"
				v-tip="t('components.particleLayer-color-endMax-0.tip')"
					v-model="form.color.endMax[0]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMax-1"
				v-tip="t('components.particleLayer-color-endMax-1.tip')"
					v-model="form.color.endMax[1]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMax-2"
				v-tip="t('components.particleLayer-color-endMax-2.tip')"
					v-model="form.color.endMax[2]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMax-3"
				v-tip="t('components.particleLayer-color-endMax-3.tip')"
					v-model="form.color.endMax[3]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-tint-0-box.label') || 'Tint - Red' }}
			</div>
			<div class="flex-box" id="particleLayer-color-tint-0-box"
				v-tip="t('components.particleLayer-color-tint-0-box.tip')" ref="elTint0Box">
				<SliderBox
				id="particleLayer-color-tint-0-slider"
				ref="elTint0Slider"
				v-model="form.color.tint[0]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
				id="particleLayer-color-tint-0"
				ref="elTint0"
				v-model="form.color.tint[0]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-tint-1-box.label') || 'Tint - Green' }}
			</div>
			<div class="flex-box" id="particleLayer-color-tint-1-box"
				v-tip="t('components.particleLayer-color-tint-1-box.tip')" ref="elTint1Box">
				<SliderBox
				id="particleLayer-color-tint-1-slider"
				ref="elTint1Slider"
				v-model="form.color.tint[1]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
				id="particleLayer-color-tint-1"
				ref="elTint1"
				v-model="form.color.tint[1]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-tint-2-box.label') || 'Tint - Blue' }}
			</div>
			<div class="flex-box" id="particleLayer-color-tint-2-box"
				v-tip="t('components.particleLayer-color-tint-2-box.tip')" ref="elTint2Box">
				<SliderBox
				id="particleLayer-color-tint-2-slider"
				ref="elTint2Slider"
				v-model="form.color.tint[2]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
				id="particleLayer-color-tint-2"
				ref="elTint2"
				v-model="form.color.tint[2]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-tint-3-box.label') || 'Tint - Grayscale' }}
			</div>
			<div class="flex-box" id="particleLayer-color-tint-3-box"
				v-tip="t('components.particleLayer-color-tint-3-box.tip')" ref="elTint3Box">
				<SliderBox
				id="particleLayer-color-tint-3-slider"
				ref="elTint3Slider"
				v-model="form.color.tint[3]"
					min="0"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
				id="particleLayer-color-tint-3"
				ref="elTint3"
				v-model="form.color.tint[3]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { Particle } from '@app/particle/particle-window.ts';
import { useParticleLayerPage } from '@app/composables/useParticleLayerPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const local = useLocalStore();
const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useParticleLayerPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const getOptions = (id: string) =>
	local.components?.[id]?.options as Record<string, { name?: string }> | undefined;

const { bindInput, bindSliders } = useInspectorInput();

type SyncTarget = HTMLElement & {
	write(value: number | string): void;
	input: HTMLInputElement;
};

const elAreaType = ref<InstanceType<typeof SelectBox> | null>(null);
const elAreaX = ref<InstanceType<typeof NumberBox> | null>(null);
const elAreaY = ref<InstanceType<typeof NumberBox> | null>(null);
const elAreaWidth = ref<InstanceType<typeof NumberBox> | null>(null);
const elAreaHeight = ref<InstanceType<typeof NumberBox> | null>(null);
const elAreaRadius = ref<InstanceType<typeof NumberBox> | null>(null);
const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);
const elLight = ref<InstanceType<typeof SelectBox> | null>(null);
const elSort = ref<InstanceType<typeof SelectBox> | null>(null);
const elSpriteMode = ref<InstanceType<typeof SelectBox> | null>(null);
const elSpriteInterval = ref<InstanceType<typeof NumberBox> | null>(null);
const elColorMode = ref<InstanceType<typeof SelectBox> | null>(null);
const elColorEasingId = ref<InstanceType<typeof SelectBox> | null>(null);
const elColorRgbaBox = ref<HTMLElement | null>(null);
const elColorMinBox = ref<HTMLElement | null>(null);
const elColorMaxBox = ref<HTMLElement | null>(null);
const elColorStartMinBox = ref<HTMLElement | null>(null);
const elColorStartMaxBox = ref<HTMLElement | null>(null);
const elColorEndMinBox = ref<HTMLElement | null>(null);
const elColorEndMaxBox = ref<HTMLElement | null>(null);
const elTint0Box = ref<HTMLElement | null>(null);
const elTint1Box = ref<HTMLElement | null>(null);
const elTint2Box = ref<HTMLElement | null>(null);
const elTint3Box = ref<HTMLElement | null>(null);
const elTint0Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint0 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint1Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint1 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint2Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint2 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint3Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint3 = ref<InstanceType<typeof NumberBox> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'particleLayer-color-easingId', elColorEasingId.value);
	const editor = Inspector.particleLayer;
	if (!editor) return;

	const el = document.getElementById('particleLayer-vue-mount');
	if (el) {
		attachElementApi(el, { sync, form });
	}

	elAreaType.value?.loadItems([
		{ name: 'Point', value: 'point' },
		{ name: 'Rectangle', value: 'rectangle' },
		{ name: 'Circle', value: 'circle' },
		{ name: 'Screen Edge', value: 'edge' }
	]);
	if (elAreaType.value) {
		elAreaType.value.enableHiddenMode();
		elAreaType.value.relate([
			{
				case: 'point',
				targets: [elAreaX.value?.root ?? null, elAreaY.value?.root ?? null]
			},
			{
				case: 'rectangle',
				targets: [
					elAreaX.value?.root ?? null,
					elAreaY.value?.root ?? null,
					elAreaWidth.value?.root ?? null,
					elAreaHeight.value?.root ?? null
				]
			},
			{
				case: 'circle',
				targets: [
					elAreaX.value?.root ?? null,
					elAreaY.value?.root ?? null,
					elAreaRadius.value?.root ?? null
				]
			}
		]);
	}

	if (elBlend.value) {
		const blendName = (key: string, fallback: string) =>
			getOptions('particleLayer-blend')?.[key]?.name || fallback;
		elBlend.value.loadItems([
			{ name: blendName('normal', 'Normal'), value: 'normal' },
			{ name: blendName('additive', 'Additive'), value: 'additive' },
			{ name: blendName('subtract', 'Subtract'), value: 'subtract' }
		]);
	}

	if (elLight.value) {
		const lightName = (key: string, fallback: string) =>
			getOptions('particleLayer-light')?.[key]?.name || fallback;
		elLight.value.loadItems([
			{ name: lightName('raw', 'Raw'), value: 'raw' },
			{ name: lightName('global', 'Global Sampling'), value: 'global' },
			{ name: lightName('ambient', 'Ambient Light'), value: 'ambient' }
		]);
	}

	elSort.value?.loadItems([
		{ name: 'Youngest in Front', value: 'youngest-in-front' },
		{ name: 'Oldest in Front', value: 'oldest-in-front' },
		{ name: 'By Scale Factor', value: 'by-scale-factor' }
	]);

	elSpriteMode.value?.loadItems([
		{ name: 'Random', value: 'random' },
		{ name: 'Animation', value: 'animation' },
		{ name: 'Animation(Loop)', value: 'animation-loop' }
	]);
	if (elSpriteMode.value) {
		elSpriteMode.value.enableHiddenMode();
		elSpriteMode.value.relate([
			{
				case: ['animation', 'animation-loop'],
				targets: [elSpriteInterval.value?.root ?? null]
			}
		]);
	}

	elColorMode.value?.loadItems([
		{ name: 'Fixed', value: 'fixed' },
		{ name: 'Random', value: 'random' },
		{ name: 'Easing', value: 'easing' },
		{ name: 'Texture Sampling', value: 'texture' }
	]);
	if (elColorMode.value) {
		elColorMode.value.enableHiddenMode();
		elColorMode.value.relate([
			{ case: 'fixed', targets: [elColorRgbaBox.value] },
			{
				case: 'random',
				targets: [elColorMinBox.value, elColorMaxBox.value]
			},
			{
				case: 'easing',
				targets: [
					elColorEasingId.value?.root ?? null,
					elColorStartMinBox.value,
					elColorStartMaxBox.value,
					elColorEndMinBox.value,
					elColorEndMaxBox.value
				]
			},
			{
				case: 'texture',
				targets: [elTint0Box.value, elTint1Box.value, elTint2Box.value, elTint3Box.value]
			}
		]);
	}

	elTint0Slider.value?.synchronize(elTint0.value?.root as SyncTarget);
	elTint1Slider.value?.synchronize(elTint1.value?.root as SyncTarget);
	elTint2Slider.value?.synchronize(elTint2.value?.root as SyncTarget);
	elTint3Slider.value?.synchronize(elTint3.value?.root as SyncTarget);

	const elements = document.querySelectorAll(
		'#particleLayer-name, #particleLayer-area-type, #particleLayer-area-x, #particleLayer-area-y, #particleLayer-area-width, #particleLayer-area-height, #particleLayer-area-radius, #particleLayer-count, #particleLayer-delay, #particleLayer-interval, #particleLayer-lifetime, #particleLayer-lifetimeDev, #particleLayer-fadeout, #particleLayer-anchor-x-0, #particleLayer-anchor-x-1, #particleLayer-anchor-y-0, #particleLayer-anchor-y-1, #particleLayer-anchor-speedX-0, #particleLayer-anchor-speedX-1, #particleLayer-anchor-speedY-0, #particleLayer-anchor-speedY-1, #particleLayer-movement-angle-0, #particleLayer-movement-angle-1, #particleLayer-movement-speed-0, #particleLayer-movement-speed-1, #particleLayer-movement-accelAngle-0, #particleLayer-movement-accelAngle-1, #particleLayer-movement-accel-0, #particleLayer-movement-accel-1, #particleLayer-rotation-angle-0, #particleLayer-rotation-angle-1, #particleLayer-rotation-speed-0, #particleLayer-rotation-speed-1, #particleLayer-rotation-accel-0, #particleLayer-rotation-accel-1, #particleLayer-hRotation-radius-0, #particleLayer-hRotation-radius-1, #particleLayer-hRotation-expansionSpeed-0, #particleLayer-hRotation-expansionSpeed-1, #particleLayer-hRotation-expansionAccel-0, #particleLayer-hRotation-expansionAccel-1, #particleLayer-hRotation-angle-0, #particleLayer-hRotation-angle-1, #particleLayer-hRotation-angularSpeed-0, #particleLayer-hRotation-angularSpeed-1, #particleLayer-hRotation-angularAccel-0, #particleLayer-hRotation-angularAccel-1, #particleLayer-scale-factor-0, #particleLayer-scale-factor-1, #particleLayer-scale-speed-0, #particleLayer-scale-speed-1, #particleLayer-scale-accel-0, #particleLayer-scale-accel-1, #particleLayer-image, #particleLayer-blend, #particleLayer-light, #particleLayer-sort, #particleLayer-sprite-mode, #particleLayer-sprite-hframes, #particleLayer-sprite-vframes, #particleLayer-sprite-interval, #particleLayer-color-mode, #particleLayer-color-rgba-0, #particleLayer-color-rgba-1, #particleLayer-color-rgba-2, #particleLayer-color-rgba-3, #particleLayer-color-min-0, #particleLayer-color-min-1, #particleLayer-color-min-2, #particleLayer-color-min-3, #particleLayer-color-max-0, #particleLayer-color-max-1, #particleLayer-color-max-2, #particleLayer-color-max-3, #particleLayer-color-easingId, #particleLayer-color-startMin-0, #particleLayer-color-startMin-1, #particleLayer-color-startMin-2, #particleLayer-color-startMin-3, #particleLayer-color-startMax-0, #particleLayer-color-startMax-1, #particleLayer-color-startMax-2, #particleLayer-color-startMax-3, #particleLayer-color-endMin-0, #particleLayer-color-endMin-1, #particleLayer-color-endMin-2, #particleLayer-color-endMin-3, #particleLayer-color-endMax-0, #particleLayer-color-endMax-1, #particleLayer-color-endMax-2, #particleLayer-color-endMax-3, #particleLayer-color-tint-0, #particleLayer-color-tint-1, #particleLayer-color-tint-2, #particleLayer-color-tint-3'
	);
	const sliders = document.querySelectorAll(
		'#particleLayer-color-tint-0-slider, #particleLayer-color-tint-1-slider, #particleLayer-color-tint-2-slider, #particleLayer-color-tint-3-slider'
	);
	bindInput(elements, editor, Particle as unknown as { history: unknown });
	bindSliders(sliders);
	const refreshLocalizedItems = () => {
		const getNames = (id: string, values: string[]) => {
			const options = getOptions(id);
			return values.map((value) => ({ name: options?.[value]?.name || value, value }));
		};
		elBlend.value?.loadItems(
			getNames('particleLayer-blend', ['normal', 'additive', 'subtract'])
		);
		elLight.value?.loadItems(getNames('particleLayer-light', ['raw', 'global', 'ambient']));
	};
	window.addEventListener('localize', refreshLocalizedItems);
	watch(
		() => local.components,
		() => refreshLocalizedItems()
	);
	onBeforeUnmount(() => window.removeEventListener('localize', refreshLocalizedItems));

	sync();
});
</script>
