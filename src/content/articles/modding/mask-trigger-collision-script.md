---
articleId: mask-trigger-collision-script
title: Mask Trigger Collision Script
description: This page is part of the Building making tutorial. The game actually does this automatically, every time the mod is loaded to the game. So, you only need to…
categories:
  - Modding
layout: modding
---

This page is part of the [Building making tutorial](/building-making-tutorial). The game actually does this automatically, every time the mod is loaded to the game. So, you only need to do this IF you need some other settings than default for the collision. **Which includes weather dust interior removal.** This is the reason I do not delete this page, as someone might need to change the flags, some day.

NOTE NOTE NOTE This script only works with cube as the collision starting primitive. If your exported xml says 'triangle' this will not work. Unfortunately I could not find a vanilla collision script that was made for triangles (or any other shape than a cube), so I do not know what changes would need to be done to make the script work for non-cube primitives.

## How to make a Mask Trigger Collision Script

1) Crate a collision file normally for your mask trigger, move it to your mod folder and then just edit with notepad++ or visual studio and **copy the dimensions to a separate notepad**

2) Replace the entirety of it with the code below.

3) Replace "D:\\Kenshi\\mods\\MyMod\\buildings\\FloorOneTrigger.xml" with your mod's actual path and collision xml file name.

NOTENOTENOTE: it HAS TO be the same name as the actual script and it has to be your mod's folder!! This is not a reference to the mesh, this is reference to itself.

4) Search for dimensions and replace the data on <NxBoxShapeDesc dimensions="236.286682 236.286682 100.949497"/> with your dimensions. If you have an off-center build, also replace the global position with yours.

If you need to make an odd shaped mask, fe. a pyramid etc. export the mesh as normal but create a collision box shape that encompasses the building and export that as collision shape box. Opening that in an editor (like notepad++ or visual studio) allows you to copy the dimensions and global position. Do not adjust the collision shape in this script.

Remember, if you replace an existing house collision, to delete its bin file before testing.

<NXUSTREAM2>
         <NxuPhysicsCollection id\="D:\\Kenshi\\mods\\MyMod\\buildings\\FloorOneTrigger.xml" nxuVersion="103" sdkVersion="284">
			<NxPhysicsSDKDesc id\="SDK">
			<hwPageSize>65536</hwPageSize>
			<hwPageMax>256</hwPageMax>
			<hwConvexMax>2048</hwConvexMax>
		</NxPhysicsSDKDesc>
		<NxParameterDesc param\="NX\_PENALTY\_FORCE" value="0.800000012"/>
		<NxParameterDesc param\="NX\_SKIN\_WIDTH" value="0.100000001"/>
		<NxParameterDesc param\="NX\_DEFAULT\_SLEEP\_LIN\_VEL\_SQUARED" value="0.010000001"/>
		<NxParameterDesc param\="NX\_DEFAULT\_SLEEP\_ANG\_VEL\_SQUARED" value="0.010000001"/>
		<NxParameterDesc param\="NX\_BOUNCE\_THRESHOLD" value="-200"/>
		<NxParameterDesc param\="NX\_DYN\_FRICT\_SCALING" value="1"/>
		<NxParameterDesc param\="NX\_STA\_FRICT\_SCALING" value="1"/>
		<NxParameterDesc param\="NX\_MAX\_ANGULAR\_VELOCITY" value="7"/>
		<NxParameterDesc param\="NX\_CONTINUOUS\_CD" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZATION\_SCALE" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_WORLD\_AXES" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_BODY\_AXES" value="1"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_BODY\_MASS\_AXES" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_BODY\_LIN\_VELOCITY" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_BODY\_ANG\_VELOCITY" value="0"/>
		<NxParameterDesc param\="NX\_DUMMY15" value="0"/>
		<NxParameterDesc param\="NX\_DUMMY16" value="0"/>
		<NxParameterDesc param\="NX\_DUMMY17" value="0"/>
		<NxParameterDesc param\="NX\_DUMMY18" value="0"/>
		<NxParameterDesc param\="NX\_DUMMY19" value="0"/>
		<NxParameterDesc param\="NX\_DUMMY20" value="0"/>
		<NxParameterDesc param\="NX\_DUMMY21" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_BODY\_JOINT\_GROUPS" value="0"/>
		<NxParameterDesc param\="NX\_DUMMY23" value="0"/>
		<NxParameterDesc param\="NX\_DUMMY24" value="0"/>
		<NxParameterDesc param\="NX\_DUMMY25" value="0"/>
		<NxParameterDesc param\="NX\_DUMMY26" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_JOINT\_LOCAL\_AXES" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_JOINT\_WORLD\_AXES" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_JOINT\_LIMITS" value="0"/>
		<NxParameterDesc param\="NX\_DUMMY30" value="0"/>
		<NxParameterDesc param\="NX\_DUMMY31" value="0"/>
		<NxParameterDesc param\="NX\_DUMMY32" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_CONTACT\_POINT" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_CONTACT\_NORMAL" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_CONTACT\_ERROR" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_CONTACT\_FORCE" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_ACTOR\_AXES" value="1"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_COLLISION\_AABBS" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_COLLISION\_SHAPES" value="1"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_COLLISION\_AXES" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_COLLISION\_COMPOUNDS" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_COLLISION\_VNORMALS" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_COLLISION\_FNORMALS" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_COLLISION\_EDGES" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_COLLISION\_SPHERES" value="0"/>
		<NxParameterDesc param\="NX\_DUMMY46" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_COLLISION\_STATIC" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_COLLISION\_DYNAMIC" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_COLLISION\_FREE" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_COLLISION\_CCD" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_COLLISION\_SKELETONS" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_FLUID\_EMITTERS" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_FLUID\_POSITION" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_FLUID\_VELOCITY" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_FLUID\_KERNEL\_RADIUS" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_FLUID\_BOUNDS" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_FLUID\_PACKETS" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_FLUID\_MOTION\_LIMIT" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_FLUID\_DYN\_COLLISION" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_FLUID\_STC\_COLLISION" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_FLUID\_MESH\_PACKETS" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_FLUID\_DRAINS" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_CLOTH\_MESH" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_CLOTH\_COLLISIONS" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_CLOTH\_SELFCOLLISIONS" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_CLOTH\_WORKPACKETS" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_CLOTH\_SLEEP" value="0"/>
		<NxParameterDesc param\="NX\_ADAPTIVE\_FORCE" value="1"/>
		<NxParameterDesc param\="NX\_COLL\_VETO\_JOINTED" value="1"/>
		<NxParameterDesc param\="NX\_TRIGGER\_TRIGGER\_CALLBACK" value="1"/>
		<NxParameterDesc param\="NX\_SELECT\_HW\_ALGO" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_ACTIVE\_VERTICES" value="0"/>
		<NxParameterDesc param\="NX\_CCD\_EPSILON" value="0.01"/>
		<NxParameterDesc param\="NX\_SOLVER\_CONVERGENCE\_THRESHOLD" value="0"/>
		<NxParameterDesc param\="NX\_BBOX\_NOISE\_LEVEL" value="0.001"/>
		<NxParameterDesc param\="NX\_IMPLICIT\_SWEEP\_CACHE\_SIZE" value="5"/>
		<NxParameterDesc param\="NX\_DEFAULT\_SLEEP\_ENERGY" value="0.005"/>
		<NxParameterDesc param\="NX\_CONSTANT\_FLUID\_MAX\_PACKETS" value="925"/>
		<NxParameterDesc param\="NX\_CONSTANT\_FLUID\_MAX\_PARTICLES\_PER\_STEP" value="4096"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_CLOTH\_TEARABLE\_VERTICES" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_CLOTH\_TEARING" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_CLOTH\_ATTACHMENT" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_SOFTBODY\_MESH" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_SOFTBODY\_COLLISIONS" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_SOFTBODY\_WORKPACKETS" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_SOFTBODY\_SLEEP" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_SOFTBODY\_TEARABLE\_VERTICES" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_SOFTBODY\_TEARING" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_SOFTBODY\_ATTACHMENT" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_FLUID\_PACKET\_DATA" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_FORCE\_FIELDS" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_CLOTH\_VALIDBOUNDS" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_SOFTBODY\_VALIDBOUNDS" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_CLOTH\_SLEEP\_VERTEX" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_SOFTBODY\_SLEEP\_VERTEX" value="0"/>
		<NxParameterDesc param\="NX\_ASYNCHRONOUS\_MESH\_CREATION" value="0"/>
		<NxParameterDesc param\="NX\_FORCE\_FIELD\_CUSTOM\_KERNEL\_EPSILON" value="0.001"/>
		<NxParameterDesc param\="NX\_IMPROVED\_SPRING\_SOLVER" value="1"/>
		<NxParameterDesc param\="NX\_FAST\_MASSIVE\_BP\_VOLUME\_DELETION" value="0"/>
		<NxParameterDesc param\="NX\_LEGACY\_JOINT\_DRIVE" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_CLOTH\_HIERARCHY" value="0"/>
		<NxParameterDesc param\="NX\_VISUALIZE\_CLOTH\_HARD\_STRETCHING\_LIMITATION" value="0"/>
		<NxConvexMeshDesc id\="ConvexMesh\_0" userProperties="">
			<points></points>
			<triangles></triangles>
			<NxConvexFlags id\="flags">
				<NX\_CF\_FLIPNORMALS>false</NX\_CF\_FLIPNORMALS>
				<NX\_CF\_16\_BIT\_INDICES>false</NX\_CF\_16\_BIT\_INDICES>
				<NX\_CF\_COMPUTE\_CONVEX>false</NX\_CF\_COMPUTE\_CONVEX>
				<NX\_CF\_INFLATE\_CONVEX>false</NX\_CF\_INFLATE\_CONVEX>
				<NX\_CF\_USE\_UNCOMPRESSED\_NORMALS>false</NX\_CF\_USE\_UNCOMPRESSED\_NORMALS>
			</NxConvexFlags>
			<cookedDataSize>892</cookedDataSize>
			<cookedData>
				4E5853014356584D030000000000000049434501434C484C00000000494345014356484C05000000080000000C0000000C000000060000001800000018000000
				40780042775295C14CFE5142EFE8FF41A038C542E4E45342977005C2FC38C542A3105542565113C251F495C1393A534202D7FE41585FC542C80B6B40A6E5FF41
				C25295C1B5108E404D5113C24DF495C15CB17E403E6E05C24860C542341E4F400700000000010200020304050604060703020703070605040105010000030600
				0605020104020407000013F601F60EF619F625F633F639F62EF6DAC2D5BF36961E42C8F0E241040000000000000000000000B9C6923BB09B84BBCEFE7F3FFDDD
				52C2C2FD2B40FDDD52420400000004000000080000000641DB3BAFE5D5BB23FD7FBFAA4F8340F88558C2AA4F83C004000000080000001000000061E37FBFA414
				F23C81A31CB5A20911C2BB9E02C2A2091142040000000C00000018000000B8FF7F3F6D46913A3CAF31BB59A2FFC10FF913C259A2FF4104000000100000002000
				0000D33C963AF6FF7FBF0E1F1DB4D39D95C1D473C5C2D39D9541040000001400000028000000D3959437EBFF7F3F9911C93A7662C5C216E995C17662C5420001
				020304050607030207060504010000030605020104070B00000000030501080A0B0905060B070804000201070A02030409060000000000000000000100030005
				0102010402030207030604050407050606079107960733F0840722F08D0F0AF03BF0B107A407B607AD0700000000000000000000000000000000020000000202
				020202020202020202021600000000020406080A0C0E101214160003000403040005030500020205020401030105010401024943450156414C45020000000800
				000024000000050000000504050405040504010203050600020405000103040700020607010205060700010406000304050702030406620000004F5043010100
				000003000000010000000180FF7FFF7FFF7FFF7F0080000000C000000000DEC9963874E49F3A4904623ADFE5893A32DFEA3A5020483A48424D01000000000200
				00006500000005650C0000000B000000000304060A0B0107080902054860C53770271EC0C6FD1F42709CE241BDA49042565113C251F495C1341E4F4040780042
				4860C542A3105542F988BC480398AB4EAE748F4BB8A6874BAE748F4B03ACFE4D5DFFCECDB8A6874B5DFFCECD0CBC8E4E77C5D2BF7AC31E4259EBE241
			</cookedData>
		</NxConvexMeshDesc>
		<NxSceneDesc id\="Scene\_0" userProperties="" hasMaxBounds="false" hasLimits="false" hasFilter="true">
			<filterBool>true</filterBool>
			<filterOp0>NX\_FILTEROP\_AND</filterOp0>
			<filterOp1>NX\_FILTEROP\_AND</filterOp1>
			<filterOp2>NX\_FILTEROP\_AND</filterOp2>
			<NxGroupsMask id\="groupMask0" bits0="0" bits1="0" bits2="0" bits3="0"/>
			<NxGroupsMask id\="groupMask1" bits0="0" bits1="0" bits2="0" bits3="0"/>
			<gravity>0 0 \-981.000061035</gravity>
			<maxTimestep>0.016666668</maxTimestep>
			<maxIter>8</maxIter>
			<timeStepMethod>NX\_TIMESTEP\_FIXED</timeStepMethod>
			<maxBounds>0 0 0  FLT\_MAX FLT\_MAX FLT\_MAX</maxBounds>
			<NxSceneLimits id\="limits">
				<maxNbActors>0</maxNbActors>
				<maxNbBodies>0</maxNbBodies>
				<maxNbStaticShapes>0</maxNbStaticShapes>
				<maxNbDynamicShapes>0</maxNbDynamicShapes>
				<maxNbJoints>0</maxNbJoints>
			</NxSceneLimits>
			<simType>NX\_SIMULATION\_SW</simType>
			<groundPlane>false</groundPlane>
			<boundsPlanes>false</boundsPlanes>
			<NxSceneFlags id\="flags">
				<NX\_SF\_DISABLE\_SSE>false</NX\_SF\_DISABLE\_SSE>
				<NX\_SF\_DISABLE\_COLLISIONS>false</NX\_SF\_DISABLE\_COLLISIONS>
				<NX\_SF\_SIMULATE\_SEPARATE\_THREAD>false</NX\_SF\_SIMULATE\_SEPARATE\_THREAD>
				<NX\_SF\_ENABLE\_MULTITHREAD>false</NX\_SF\_ENABLE\_MULTITHREAD>
				<NX\_SF\_ENABLE\_ACTIVETRANSFORMS>false</NX\_SF\_ENABLE\_ACTIVETRANSFORMS>
				<NX\_SF\_RESTRICTED\_SCENE>false</NX\_SF\_RESTRICTED\_SCENE>
				<NX\_SF\_DISABLE\_SCENE\_MUTEX>false</NX\_SF\_DISABLE\_SCENE\_MUTEX>
				<NX\_SF\_FORCE\_CONE\_FRICTION>false</NX\_SF\_FORCE\_CONE\_FRICTION>
				<NX\_SF\_SEQUENTIAL\_PRIMARY>false</NX\_SF\_SEQUENTIAL\_PRIMARY>
				<NX\_SF\_FLUID\_PERFORMANCE\_HINT>false</NX\_SF\_FLUID\_PERFORMANCE\_HINT>
			</NxSceneFlags>
			<internalThreadCount>0</internalThreadCount>
			<backgroundThreadCount>0</backgroundThreadCount>
			<threadMask>0</threadMask>
			<backgroundThreadMask>0</backgroundThreadMask>
			<simThreadStackSize>0</simThreadStackSize>
			<simThreadPriority>NX\_TP\_NORMAL</simThreadPriority>
			<simThreadMask>0</simThreadMask>
			<workerThreadStackSize>0</workerThreadStackSize>
			<workerThreadPriority>NX\_TP\_NORMAL</workerThreadPriority>
			<backgroundThreadPriority>NX\_TP\_NORMAL</backgroundThreadPriority>
			<upAxis>0</upAxis>
			<subdivisionLevel>5</subdivisionLevel>
			<staticStructure>NX\_PRUNING\_STATIC\_AABB\_TREE</staticStructure>
			<dynamicStructure>NX\_PRUNING\_NONE</dynamicStructure>
			<dynamicTreeRebuildRateHint>100</dynamicTreeRebuildRateHint>
			<bpType>NX\_BP\_TYPE\_SAP\_SINGLE</bpType>
			<nbGridCellsX>0</nbGridCellsX>
			<nbGridCellsY>0</nbGridCellsY>
			<solverBatchSize>32</solverBatchSize>
			<NxMaterialDesc id\="Material\_0" userProperties="" hasSpring="false" materialIndex="0">
				<dynamicFriction>0</dynamicFriction>
				<staticFriction>0</staticFriction>
				<restitution>0</restitution>
				<dynamicFrictionV>0</dynamicFrictionV>
				<staticFrictionV>0</staticFrictionV>
				<frictionCombineMode>NX\_CM\_AVERAGE</frictionCombineMode>
				<restitutionCombineMode>NX\_CM\_AVERAGE</restitutionCombineMode>
				<dirOfAnisotropy>0 0 0</dirOfAnisotropy>
				<NxMaterialFlag id\="flags">
					<NX\_MF\_ANISOTROPIC>false</NX\_MF\_ANISOTROPIC>
					<NX\_MF\_DISABLE\_FRICTION>false</NX\_MF\_DISABLE\_FRICTION>
					<NX\_MF\_DISABLE\_STRONG\_FRICTION>false</NX\_MF\_DISABLE\_STRONG\_FRICTION>
				</NxMaterialFlag>
			</NxMaterialDesc>
			<NxMaterialDesc id\="Material\_1" userProperties="" hasSpring="false" materialIndex="1">
				<dynamicFriction>0.300000012</dynamicFriction>
				<staticFriction>0.300000012</staticFriction>
				<restitution>0.5</restitution>
				<dynamicFrictionV>0</dynamicFrictionV>
				<staticFrictionV>0</staticFrictionV>
				<frictionCombineMode>NX\_CM\_AVERAGE</frictionCombineMode>
				<restitutionCombineMode>NX\_CM\_AVERAGE</restitutionCombineMode>
				<dirOfAnisotropy>1 0 0</dirOfAnisotropy>
				<NxMaterialFlag id\="flags">
					<NX\_MF\_ANISOTROPIC>false</NX\_MF\_ANISOTROPIC>
					<NX\_MF\_DISABLE\_FRICTION>false</NX\_MF\_DISABLE\_FRICTION>
					<NX\_MF\_DISABLE\_STRONG\_FRICTION>false</NX\_MF\_DISABLE\_STRONG\_FRICTION>
				</NxMaterialFlag>
			</NxMaterialDesc>
			<NxActorDesc id\="Actor\_0" userProperties="" hasBody="false" name="Cube.001">
				<globalPose>1.000000 0.000000 0.000000  0.000000 1.000000 0.000000  0.000000 0.000000 1.000000  0.000000 0.000000 0.000000</globalPose>
				<NxBoxShapeDesc dimensions\="236.286682 236.286682 100.949497"/>

				<density>0</density>
				<NxActorFlag id\="flags">
					<NX\_AF\_DISABLE\_COLLISION>false</NX\_AF\_DISABLE\_COLLISION>
					<NX\_AF\_DISABLE\_RESPONSE>false</NX\_AF\_DISABLE\_RESPONSE>
					<NX\_AF\_LOCK\_COM>false</NX\_AF\_LOCK\_COM>
					<NX\_AF\_FLUID\_DISABLE\_COLLISION>false</NX\_AF\_FLUID\_DISABLE\_COLLISION>
					<NX\_AF\_CONTACT\_MODIFICATION>false</NX\_AF\_CONTACT\_MODIFICATION>
					<NX\_AF\_FORCE\_CONE\_FRICTION>false</NX\_AF\_FORCE\_CONE\_FRICTION>
					<NX\_AF\_USER\_ACTOR\_PAIR\_FILTERING>false</NX\_AF\_USER\_ACTOR\_PAIR\_FILTERING>
				</NxActorFlag>
				<group>0</group>
				<compartment></compartment>
				<NxConvexShapeDesc meshData\="ConvexMesh\_0">
					<NxMeshShapeFlag id\="meshFlags">
						<NX\_MESH\_SMOOTH\_SPHERE\_COLLISIONS>false</NX\_MESH\_SMOOTH\_SPHERE\_COLLISIONS>
						<NX\_MESH\_DOUBLE\_SIDED>false</NX\_MESH\_DOUBLE\_SIDED>
					</NxMeshShapeFlag>
					<NxShapeDesc userProperties\="" name="Storm\_Shack\_INTERIOR\_TRIGGER">
						<localPose>1 0 0  0 1 0  0 0 1  0 0 0</localPose>
						<NxShapeFlag id\="shapeFlags">
							<NX\_TRIGGER\_ON\_ENTER>false</NX\_TRIGGER\_ON\_ENTER>
							<NX\_TRIGGER\_ON\_LEAVE>false</NX\_TRIGGER\_ON\_LEAVE>
							<NX\_TRIGGER\_ON\_STAY>false</NX\_TRIGGER\_ON\_STAY>
							<NX\_SF\_VISUALIZATION>true</NX\_SF\_VISUALIZATION>
							<NX\_SF\_DISABLE\_COLLISION>false</NX\_SF\_DISABLE\_COLLISION>
							<NX\_SF\_FEATURE\_INDICES>false</NX\_SF\_FEATURE\_INDICES>
							<NX\_SF\_DISABLE\_RAYCASTING>false</NX\_SF\_DISABLE\_RAYCASTING>
							<NX\_SF\_POINT\_CONTACT\_FORCE>true</NX\_SF\_POINT\_CONTACT\_FORCE>
							<NX\_SF\_FLUID\_DRAIN>false</NX\_SF\_FLUID\_DRAIN>
							<NX\_SF\_FLUID\_DISABLE\_COLLISION>false</NX\_SF\_FLUID\_DISABLE\_COLLISION>
							<NX\_SF\_FLUID\_TWOWAY>false</NX\_SF\_FLUID\_TWOWAY>
							<NX\_SF\_DISABLE\_RESPONSE>false</NX\_SF\_DISABLE\_RESPONSE>
							<NX\_SF\_DYNAMIC\_DYNAMIC\_CCD>false</NX\_SF\_DYNAMIC\_DYNAMIC\_CCD>
							<NX\_SF\_DISABLE\_SCENE\_QUERIES>false</NX\_SF\_DISABLE\_SCENE\_QUERIES>
							<NX\_SF\_CLOTH\_DRAIN>false</NX\_SF\_CLOTH\_DRAIN>
							<NX\_SF\_CLOTH\_DISABLE\_COLLISION>false</NX\_SF\_CLOTH\_DISABLE\_COLLISION>
							<NX\_SF\_CLOTH\_TWOWAY>true</NX\_SF\_CLOTH\_TWOWAY>
							<NX\_SF\_SOFTBODY\_DRAIN>false</NX\_SF\_SOFTBODY\_DRAIN>
							<NX\_SF\_SOFTBODY\_DISABLE\_COLLISION>false</NX\_SF\_SOFTBODY\_DISABLE\_COLLISION>
							<NX\_SF\_SOFTBODY\_TWOWAY>true</NX\_SF\_SOFTBODY\_TWOWAY>
						</NxShapeFlag>
						<group>0</group>
						<materialIndex>1</materialIndex>
						<CCDSkeleton></CCDSkeleton>
						<shapeDensity>0</shapeDensity>
						<shapeMass>190.227828979</shapeMass>
						<skinWidth>0.100000001</skinWidth>
						<NxGroupsMask id\="groupsMask" bits0="1" bits1="0" bits2="1" bits3="0"/>
						<NxShapeCompartmentType id\="nonInteractingCompartmentTypes">
							<NX\_COMPARTMENT\_SW\_RIGIDBODY>false</NX\_COMPARTMENT\_SW\_RIGIDBODY>
							<NX\_COMPARTMENT\_HW\_RIGIDBODY>false</NX\_COMPARTMENT\_HW\_RIGIDBODY>
							<NX\_COMPARTMENT\_SW\_FLUID>false</NX\_COMPARTMENT\_SW\_FLUID>
							<NX\_COMPARTMENT\_HW\_FLUID>false</NX\_COMPARTMENT\_HW\_FLUID>
							<NX\_COMPARTMENT\_SW\_CLOTH>false</NX\_COMPARTMENT\_SW\_CLOTH>
							<NX\_COMPARTMENT\_HW\_CLOTH>false</NX\_COMPARTMENT\_HW\_CLOTH>
							<NX\_COMPARTMENT\_SW\_SOFTBODY>false</NX\_COMPARTMENT\_SW\_SOFTBODY>
							<NX\_COMPARTMENT\_HW\_SOFTBODY>false</NX\_COMPARTMENT\_HW\_SOFTBODY>
						</NxShapeCompartmentType>
					</NxShapeDesc>
				</NxConvexShapeDesc>
				<dominanceGroup>0</dominanceGroup>
				<contactReportFlags>0</contactReportFlags>
				<forceFieldMaterial>0</forceFieldMaterial>
			</NxActorDesc>
			<NxActorGroupPair group0\="0" group1="0">
				<NxContactPairFlag id\="flags">
					<NX\_IGNORE\_PAIR>false</NX\_IGNORE\_PAIR>
					<NX\_NOTIFY\_ON\_START\_TOUCH>true</NX\_NOTIFY\_ON\_START\_TOUCH>
					<NX\_NOTIFY\_ON\_END\_TOUCH>true</NX\_NOTIFY\_ON\_END\_TOUCH>
					<NX\_NOTIFY\_ON\_TOUCH>true</NX\_NOTIFY\_ON\_TOUCH>
					<NX\_NOTIFY\_ON\_IMPACT>false</NX\_NOTIFY\_ON\_IMPACT>
					<NX\_NOTIFY\_ON\_ROLL>false</NX\_NOTIFY\_ON\_ROLL>
					<NX\_NOTIFY\_ON\_SLIDE>false</NX\_NOTIFY\_ON\_SLIDE>
					<NX\_NOTIFY\_FORCES>false</NX\_NOTIFY\_FORCES>
					<NX\_NOTIFY\_ON\_START\_TOUCH\_FORCE\_THRESHOLD>false</NX\_NOTIFY\_ON\_START\_TOUCH\_FORCE\_THRESHOLD>
					<NX\_NOTIFY\_ON\_END\_TOUCH\_FORCE\_THRESHOLD>false</NX\_NOTIFY\_ON\_END\_TOUCH\_FORCE\_THRESHOLD>
					<NX\_NOTIFY\_ON\_TOUCH\_FORCE\_THRESHOLD>false</NX\_NOTIFY\_ON\_TOUCH\_FORCE\_THRESHOLD>
				</NxContactPairFlag>
			</NxActorGroupPair>
		</NxSceneDesc>
	</NxuPhysicsCollection>
</NXUSTREAM2>
