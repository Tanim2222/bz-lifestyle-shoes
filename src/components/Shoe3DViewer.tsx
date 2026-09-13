import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useProgress } from "@react-three/drei";
import * as THREE from "three";
import { useScrollFraction } from "../hooks/useScrollFraction";

const MODEL_URL = "/models/shoe.glb";

// Shared centering/scale math so every shoe instance (hero + floaters)
// sits on the same footing regardless of the model's raw pivot/size.
function useShoeFit(scene: THREE.Object3D, targetSize: number) {
  return useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return { center, scale: targetSize / maxDim };
  }, [scene, targetSize]);
}

function ScrollRotatingShoe() {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);
  const { center, scale } = useShoeFit(scene, 2.4);
  const targetRotation = useRef(0.6);
  const currentRotation = useRef(0.6);
  const scrollFraction = useScrollFraction();

  useEffect(() => {
    targetRotation.current = 0.6 + scrollFraction * Math.PI * 2;
  }, [scrollFraction]);

  // Critically-damped lerp toward the scroll-driven target angle
  useFrame(() => {
    const diff = targetRotation.current - currentRotation.current;
    currentRotation.current += diff * 0.065;
    if (group.current) {
      group.current.rotation.y = currentRotation.current;
      group.current.rotation.x = 0.05;
    }
  });

  return (
    <group ref={group} scale={scale}>
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

type FloaterConfig = {
  position: [number, number, number];
  size: number;
  spinSpeed: number;
  bobPhase: number;
  bobAmplitude: number;
  tilt: [number, number, number];
};

const FLOATERS: FloaterConfig[] = [
  { position: [-3.4, 1.3, -3.5], size: 1.3, spinSpeed: 0.18, bobPhase: 0.0, bobAmplitude: 0.25, tilt: [0.2, 0, 0.4] },
  { position: [3.6, -0.5, -4.2], size: 1.6, spinSpeed: -0.13, bobPhase: 1.3, bobAmplitude: 0.3, tilt: [-0.15, 0, -0.3] },
  { position: [-2.7, -1.7, -5.6], size: 1.05, spinSpeed: 0.22, bobPhase: 2.6, bobAmplitude: 0.2, tilt: [0.3, 0, -0.2] },
  { position: [3.1, 1.9, -4.6], size: 1.4, spinSpeed: -0.16, bobPhase: 3.8, bobAmplitude: 0.28, tilt: [-0.25, 0, 0.35] },
  { position: [0.4, -2.4, -6.6], size: 1.15, spinSpeed: 0.2, bobPhase: 4.9, bobAmplitude: 0.22, tilt: [0.1, 0, -0.4] },
  { position: [-4.4, 0.1, -6.2], size: 1.5, spinSpeed: -0.11, bobPhase: 0.7, bobAmplitude: 0.3, tilt: [-0.2, 0, 0.25] },
];

function FloatingShoe({ config }: { config: FloaterConfig }) {
  const { scene } = useGLTF(MODEL_URL);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const { center, scale } = useShoeFit(scene, config.size);
  const group = useRef<THREE.Group>(null);
  const spin = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    if (!group.current) return;
    spin.current += config.spinSpeed * delta;
    group.current.rotation.y = spin.current;
    group.current.position.y =
      config.position[1] + Math.sin(state.clock.elapsedTime * 0.5 + config.bobPhase) * config.bobAmplitude;
  });

  return (
    <group
      ref={group}
      position={config.position}
      rotation={config.tilt}
    >
      <group scale={scale}>
        <group position={[-center.x, -center.y, -center.z]}>
          <primitive object={cloned} />
        </group>
      </group>
    </group>
  );
}

function ProgressReporter({ onProgress, onLoaded }: { onProgress: (n: number) => void; onLoaded: () => void }) {
  const { progress, active } = useProgress();

  useEffect(() => {
    onProgress(Math.round(progress));
    if (!active && progress >= 100) {
      const timeout = setTimeout(onLoaded, 500);
      return () => clearTimeout(timeout);
    }
  }, [progress, active, onProgress, onLoaded]);

  return null;
}

export default function Shoe3DViewer({
  onProgress,
  onLoaded,
}: {
  onProgress: (percent: number) => void;
  onLoaded: () => void;
}) {
  return (
    <>
      <ProgressReporter onProgress={onProgress} onLoaded={onLoaded} />
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [0, 0.3, 4], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 4, 11]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} />
        <directionalLight position={[-3, 2, -4]} intensity={0.6} />
        <pointLight position={[0, 2, 2]} intensity={0.4} color="#2dd4bf" />
        <Suspense fallback={null}>
          <ScrollRotatingShoe />
          {FLOATERS.map((config, i) => (
            <FloatingShoe key={i} config={config} />
          ))}
        </Suspense>
      </Canvas>
    </>
  );
}

useGLTF.preload(MODEL_URL);
