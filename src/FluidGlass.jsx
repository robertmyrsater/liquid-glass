/* eslint-disable react/no-unknown-property */
import * as THREE from 'three';
import { useRef, useState, useEffect, memo, useMemo } from 'react';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import {
  useFBO,
  useGLTF,
  useScroll,
  Image,
  Scroll,
  Preload,
  ScrollControls,
  MeshTransmissionMaterial,
  Text
} from '@react-three/drei';
import { easing } from 'maath';

export default function FluidGlass({ mode = 'lens', lensProps = {}, barProps = {}, cubeProps = {} }) {
  const Wrapper = mode === 'bar' ? Bar : mode === 'cube' ? Cube : Lens;
  const rawOverrides = mode === 'bar' ? barProps : mode === 'cube' ? cubeProps : lensProps;

  const {
    navItems = [
      { label: 'Home', link: '' },
      { label: 'About', link: '' },
      { label: 'Contact', link: '' }
    ],
    ...modeProps
  } = rawOverrides;

  return (
    <>
      <div className="wabi-logo">
        <img src="/assets/wabi-logo.png" alt="Wabi" />
      </div>
      <Canvas 
        camera={{ position: [0, 0, 20], fov: 15 }} 
        gl={{ 
          alpha: false, 
          antialias: true,
          outputColorSpace: 'srgb',
          toneMapping: 0
        }}
      >
      <ambientLight intensity={1} />
      <ScrollControls damping={0.2} pages={3} distance={0.4}>
        {mode === 'bar' && <NavItems items={navItems} />}
        <Wrapper modeProps={modeProps}>
          <Scroll>
            {/* Main headline - behind glass for refraction effect */}
            <Text 
              position={[0, 0, 5]} 
              fontSize={window.innerWidth <= 768 ? 0.12 : 0.22} 
              color="#000000" 
              anchorX="center" 
              anchorY="middle"
              letterSpacing={-0.05}
            >
              Meet Wabi.
            </Text>
            <Images />
          </Scroll>
          <Scroll html />
          <Preload />
        </Wrapper>
      </ScrollControls>
      </Canvas>
    </>
  );
}

const ModeWrapper = memo(function ModeWrapper({
  children,
  geometry,
  glb,
  geometryKey,
  lockToBottom = false,
  followPointer = true,
  modeProps = {},
  ...props
}) {
  const ref = useRef();
  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState(() => new THREE.Scene());
  const geoWidthRef = useRef(1);
  
  // Load GLB model if provided
  const { nodes } = glb ? useGLTF(glb) : { nodes: {} };
  
  // Use either GLB geometry or provided geometry
  const finalGeometry = glb ? nodes[geometryKey]?.geometry : geometry;

  useEffect(() => {
    if (finalGeometry) {
      finalGeometry.computeBoundingBox();
      geoWidthRef.current = finalGeometry.boundingBox.max.x - finalGeometry.boundingBox.min.x || 1;
    }
  }, [finalGeometry]);

  useFrame((state, delta) => {
    const { gl, viewport, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const isMobile = window.innerWidth <= 768;
    const destX = followPointer && !isMobile ? (pointer.x * v.width) / 2 : 0;
    const destY = lockToBottom ? -v.height / 2 + 0.2 : followPointer && !isMobile ? (pointer.y * v.height) / 2 : 0;
    easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);

    if (modeProps.scale == null) {
      const maxWorld = v.width * 0.9;
      const desired = maxWorld / geoWidthRef.current;
      const defaultScale = isMobile ? 0.18 : 0.15;
      ref.current.scale.setScalar(Math.min(defaultScale, desired));
    }

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    gl.setClearColor(0xffffff, 1);
  });

  const { scale, ior, thickness, anisotropy, chromaticAberration, ...extraMat } = modeProps;

  return (
    <>
      {createPortal(children, scene)}
      <mesh scale={[vp.width, vp.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent />
      </mesh>
      <mesh ref={ref} scale={scale ?? 0.15} rotation-x={Math.PI / 2} geometry={finalGeometry} {...props}>
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={ior ?? 1.05}
          thickness={thickness ?? 5}
          anisotropy={anisotropy ?? 0.01}
          chromaticAberration={chromaticAberration ?? 0.01}
          {...extraMat}
        />
      </mesh>
    </>
  );
});

function Lens({ modeProps, ...p }) {
  return <ModeWrapper glb="/assets/3d/lens.glb" geometryKey="Cylinder" followPointer modeProps={modeProps} {...p} />;
}

function Cube({ modeProps, ...p }) {
  return <ModeWrapper glb="/assets/3d/cube.glb" geometryKey="Cube" followPointer modeProps={modeProps} {...p} />;
}

function Bar({ modeProps = {}, ...p }) {
  const defaultMat = {
    transmission: 1,
    roughness: 0,
    thickness: 10,
    ior: 1.15,
    color: '#ffffff',
    attenuationColor: '#ffffff',
    attenuationDistance: 0.25
  };
  
  return (
    <ModeWrapper
      glb="/assets/3d/bar.glb"
      geometryKey="Cube"
      lockToBottom
      followPointer={false}
      modeProps={{ ...defaultMat, ...modeProps }}
      {...p}
    />
  );
}

function NavItems({ items }) {
  const group = useRef();
  const { viewport, camera } = useThree();

  const DEVICE = {
    mobile: { max: 639, spacing: 0.2, fontSize: 0.035 },
    tablet: { max: 1023, spacing: 0.24, fontSize: 0.045 },
    desktop: { max: Infinity, spacing: 0.3, fontSize: 0.045 }
  };
  const getDevice = () => {
    const w = window.innerWidth;
    return w <= DEVICE.mobile.max ? 'mobile' : w <= DEVICE.tablet.max ? 'tablet' : 'desktop';
  };

  const [device, setDevice] = useState(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { spacing, fontSize } = DEVICE[device];

  useFrame(() => {
    if (!group.current) return;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
    group.current.position.set(0, -v.height / 2 + 0.2, 15.1);

    group.current.children.forEach((child, i) => {
      child.position.x = (i - (items.length - 1) / 2) * spacing;
    });
  });

  const handleNavigate = link => {
    if (!link) return;
    link.startsWith('#') ? (window.location.hash = link) : (window.location.href = link);
  };

  return (
    <group ref={group} renderOrder={10}>
      {items.map(({ label, link }) => (
        <Text
          key={label}
          fontSize={fontSize}
          color="#333333"
          anchorX="center"
          anchorY="middle"
          depthWrite={false}
          outlineWidth={0}
          depthTest={false}
          renderOrder={10}
          onClick={e => {
            e.stopPropagation();
            handleNavigate(link);
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          {label}
        </Text>
      ))}
    </group>
  );
}

function Images() {
  const group = useRef();
  const data = useScroll();
  const { height } = useThree(s => s.viewport);

  useFrame(() => {
    // Images appear later in scroll progression
    group.current.children[0].material.zoom = 1 + data.range(0.4, 0.3) / 3;
    group.current.children[1].material.zoom = 1 + data.range(0.5, 0.3) / 3;
    group.current.children[2].material.zoom = 1 + data.range(0.6, 0.3) / 2;
    group.current.children[3].material.zoom = 1 + data.range(0.7, 0.3) / 2;
    group.current.children[4].material.zoom = 1 + data.range(0.8, 0.2) / 2;
  });

  const isMobile = window.innerWidth <= 768;
  const mobileScale = isMobile ? 0.75 : 1;
  const mobilePosition = isMobile ? 0.4 : 1;
  
  return (
    <group ref={group}>
      <Image
        position={[-2 * mobilePosition, -height * 0.8, 0]}
        scale={[3 * mobileScale, height / 1.3, 1]}
        url="https://images.unsplash.com/photo-1595001354022-29103be3b73a?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />
      <Image
        position={[2 * mobilePosition, -height * 0.9, 3]}
        scale={3 * mobileScale}
        url="https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />
      <Image
        position={[-2.05 * mobilePosition, -height * 1.5, 6]}
        scale={[1 * mobileScale, 3 * mobileScale, 1]}
        url="https://images.unsplash.com/photo-1513682121497-80211f36a7d3?q=80&w=3388&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />
      <Image
        position={[-0.6 * mobilePosition, -height * 1.8, 9]}
        scale={[1 * mobileScale, 2 * mobileScale, 1]}
        url="https://images.unsplash.com/photo-1516205651411-aef33a44f7c2?q=80&w=2843&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />
      <Image
        position={[0.75 * mobilePosition, -height * 2.0, 10.5]}
        scale={1.5 * mobileScale}
        url="https://images.unsplash.com/photo-1505069190533-da1c9af13346?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />
    </group>
  );
}

function Typography() {
  const DEVICE = {
    mobile: { fontSize: 0.15 },
    tablet: { fontSize: 0.25 },
    desktop: { fontSize: 0.4 }
  };
  const getDevice = () => {
    const w = window.innerWidth;
    return w <= 639 ? 'mobile' : w <= 1023 ? 'tablet' : 'desktop';
  };

  const [device, setDevice] = useState(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { fontSize } = DEVICE[device];

  return (
    <Text
      position={[0, 4, 10]}
      fontSize={fontSize * 1.2}
      letterSpacing={-0.05}
      outlineWidth={0}
      color="#000000"
      anchorX="center"
      anchorY="middle"
      renderOrder={100}
      depthTest={false}
    >
      Meet Wabi.
    </Text>
  );
}