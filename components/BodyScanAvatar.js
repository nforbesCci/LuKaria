'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import { Download } from '@mui/icons-material';
import { toFiniteNumber } from '../lib/body-scan-display';

/**
 * Interactive 3D avatar: loads FitXpress .obj when available, otherwise builds
 * a parametric body scaled from height / chest / waist / hips measurements.
 */
export default function BodyScanAvatar({ measurement, scan, height = 420 }) {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const modelUrl = measurement?.model_3d_url || null;
  const measurementId = scan?.measurementId || measurement?.id;

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};

    async function run() {
      setLoading(true);
      setError(null);
      const el = mountRef.current;
      if (!el) return;

      try {
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');

        if (cancelled) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        const width = el.clientWidth || 400;
        const h = height;
        const camera = new THREE.PerspectiveCamera(35, width / h, 0.1, 1000);
        camera.position.set(0, 1.2, 3.2);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, h);
        el.innerHTML = '';
        el.appendChild(renderer.domElement);

        const ambient = new THREE.AmbientLight(0xffffff, 0.75);
        scene.add(ambient);
        const key = new THREE.DirectionalLight(0xffffff, 0.85);
        key.position.set(2, 4, 3);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xffffff, 0.35);
        fill.position.set(-2, 1, -2);
        scene.add(fill);

        const grid = new THREE.GridHelper(3, 12, 0xd0d0d0, 0xe8e8e8);
        grid.position.y = 0;
        scene.add(grid);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.target.set(0, 1.0, 0);
        controls.minDistance = 1.2;
        controls.maxDistance = 6;
        controls.update();

        const material = new THREE.MeshStandardMaterial({
          color: 0xb0b0b0,
          roughness: 0.65,
          metalness: 0.05,
          flatShading: false,
        });

        let root = null;
        if (modelUrl && measurementId) {
          try {
            const proxyUrl = `/api/body-scan/model?id=${encodeURIComponent(measurementId)}`;
            const loader = new OBJLoader();
            root = await new Promise((resolve, reject) => {
              loader.load(proxyUrl, resolve, undefined, reject);
            });
          } catch (err) {
            console.warn('[BodyScanAvatar] OBJ load failed, using parametric avatar', err);
            root = null;
          }
        }

        if (!root) {
          root = buildParametricBody(THREE, material, measurement, scan);
        } else {
          root.traverse((child) => {
            if (child.isMesh) {
              child.material = material;
              child.castShadow = true;
            }
          });
          normalizeObject(THREE, root);
        }

        scene.add(root);

        let frame = 0;
        const animate = () => {
          frame = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        const onResize = () => {
          if (!mountRef.current) return;
          const w = mountRef.current.clientWidth || 400;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);

        cleanup = () => {
          cancelAnimationFrame(frame);
          window.removeEventListener('resize', onResize);
          controls.dispose();
          renderer.dispose();
          if (renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        };

        if (!cancelled) setLoading(false);
      } catch (err) {
        console.error('[BodyScanAvatar]', err);
        if (!cancelled) {
          setError(err.message || 'Could not render 3D avatar');
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [modelUrl, measurementId, measurement, scan, height]);

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" sx={{ color: '#1a3a6b', fontWeight: 700 }}>
          3D Avatar
        </Typography>
        {modelUrl && (
          <IconButton
            component="a"
            href={modelUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            aria-label="Download 3D model"
            sx={{ backgroundColor: '#f0f0f0' }}
          >
            <Download fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box sx={{ position: 'relative', height, backgroundColor: '#fff' }}>
        <Box ref={mountRef} sx={{ width: '100%', height: '100%' }} />
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.7)',
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}
        {error && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
            }}
          >
            <Typography color="error" variant="body2" align="center">
              {error}
            </Typography>
          </Box>
        )}
        {!loading && !error && (
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: '48%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(40,40,40,0.72)',
              color: '#fff',
              px: 2,
              py: 0.75,
              borderRadius: 1,
              pointerEvents: 'none',
              animation: 'bodyScanHintFade 4s ease forwards',
              '@keyframes bodyScanHintFade': {
                '0%': { opacity: 0 },
                '15%': { opacity: 1 },
                '70%': { opacity: 1 },
                '100%': { opacity: 0 },
              },
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
              Use mouse to move the model.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function normalizeObject(THREE, object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  object.position.sub(center);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = 1.7 / maxDim;
  object.scale.setScalar(scale);
  object.position.y += (size.y * scale) / 2;
}

/**
 * Simple A-pose avatar scaled from scan measurements when no .obj is available.
 */
function buildParametricBody(THREE, material, measurement, scan) {
  const group = new THREE.Group();
  const circ = measurement?.circumference_params || {};
  const heightCm =
    toFiniteNumber(measurement?.height) ??
    toFiniteNumber(scan?.heightCm) ??
    170;
  const heightM = heightCm / 100;
  const chest = toFiniteNumber(circ.chest ?? circ.upper_chest_girth) || heightCm * 0.55;
  const waist = toFiniteNumber(circ.waist) || heightCm * 0.45;
  const hips = toFiniteNumber(circ.low_hips ?? circ.high_hips) || heightCm * 0.55;

  const chestR = (chest / (2 * Math.PI)) / 100;
  const waistR = (waist / (2 * Math.PI)) / 100;
  const hipsR = (hips / (2 * Math.PI)) / 100;

  const add = (geo, y, sx = 1, sy = 1, sz = 1) => {
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.y = y;
    mesh.scale.set(sx, sy, sz);
    group.add(mesh);
    return mesh;
  };

  // Head
  add(new THREE.SphereGeometry(0.11, 24, 16), heightM * 0.93);
  // Neck
  add(new THREE.CylinderGeometry(0.05, 0.06, heightM * 0.05, 16), heightM * 0.86);
  // Torso (chest → waist → hips via stacked cylinders)
  add(new THREE.CylinderGeometry(chestR * 0.95, chestR, heightM * 0.16, 24), heightM * 0.74);
  add(new THREE.CylinderGeometry(chestR, waistR, heightM * 0.12, 24), heightM * 0.6);
  add(new THREE.CylinderGeometry(waistR, hipsR, heightM * 0.12, 24), heightM * 0.48);
  // Hips / pelvis
  add(new THREE.CylinderGeometry(hipsR, hipsR * 0.9, heightM * 0.08, 24), heightM * 0.38);

  // Arms (A-pose)
  const armLen = heightM * 0.32;
  const armR = Math.max(0.035, chestR * 0.28);
  const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(armR * 0.85, armR, armLen, 12), material);
  leftArm.position.set(-(chestR + 0.08), heightM * 0.68, 0);
  leftArm.rotation.z = Math.PI / 5;
  group.add(leftArm);
  const rightArm = leftArm.clone();
  rightArm.position.x = -leftArm.position.x;
  rightArm.rotation.z = -Math.PI / 5;
  group.add(rightArm);

  // Legs
  const legLen = heightM * 0.42;
  const thighR = Math.max(0.05, hipsR * 0.45);
  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(thighR * 0.7, thighR, legLen, 12), material);
  leftLeg.position.set(-hipsR * 0.45, heightM * 0.18, 0);
  group.add(leftLeg);
  const rightLeg = leftLeg.clone();
  rightLeg.position.x = -leftLeg.position.x;
  group.add(rightLeg);

  return group;
}
