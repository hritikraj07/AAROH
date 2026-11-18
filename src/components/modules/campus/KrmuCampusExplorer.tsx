import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SmartResolveModal } from './SmartResolveModal';
import { AlertTriangle } from 'lucide-react';

export interface CampusBuildingItem {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  floors: string;
  area: string;
  anchor: [number, number, number];
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
  highlights: string[];
}

export interface CameraPreset {
  id: string;
  label: string;
  pos: [number, number, number];
  target: [number, number, number];
}

const CAMPUS_DATA: CampusBuildingItem[] = [
  {
    id: 'aryabhata',
    code: 'BLOCK A',
    name: 'Aryabhata Block',
    subtitle: 'Central Administration, Chancellor’s Secretariat & Main Auditorium',
    floors: '5 Stories (G + 4) + 5 Rooftop Domes',
    area: '1,42,000 sq. ft.',
    anchor: [13, 18.8, 13],
    cameraPos: [14, 24, 52],
    cameraTarget: [13, 6, 13],
    highlights: [
      'Neoclassical cream sandstone south facade (#E8E1D3) with terracotta-red triangular pediment (#B84A39) & 4 fluted columns',
      'North courtyard elevation with 4-story 6-column classical portico atop white glazed podium terrace & blue-grey glass curtain wall',
      '5 white ribbed rooftop domes (1 large central cupola + 4 smaller domes on windowed drums) & solar arrays',
      'Curved serpentine paved & landscaped amphitheater forecourt outside the north courtyard entrance'
    ]
  },
  {
    id: 'bhaskaracharya',
    code: 'BLOCK B',
    name: 'Bhaskaracharya Block',
    subtitle: 'School of Engineering & Technology (SOET): CSE, AI/ML & Robotics Labs',
    floors: '5 Stories (G + 4) West Wing',
    area: '1,08,000 sq. ft.',
    anchor: [-3.5, 14.5, -1],
    cameraPos: [-22, 26, 22],
    cameraTarget: [-3.5, 5.5, -1],
    highlights: [
      'Extends northward from the west shoulder of Aryabhata Block forming the western arm of the U-shaped academic quad',
      'Cream sandstone facade with protruding vertical bay-window towers & punched classroom grids',
      'High-Performance AI/ML Computing Labs, IoT & Embedded Hardware Studios',
      'Rooftop monocrystalline solar panel arrays & centralized HVAC chillers'
    ]
  },
  {
    id: 'chanakya',
    code: 'BLOCK C',
    name: 'Chanakya Block',
    subtitle: 'School of Management, Commerce, Law & Liberal Arts',
    floors: '5 Stories (G + 4) East Wing',
    area: '1,12,000 sq. ft.',
    anchor: [29.5, 14.5, -1],
    cameraPos: [54, 26, 22],
    cameraTarget: [29.5, 5.5, -1],
    highlights: [
      'Extends northward from the east shoulder of Aryabhata Block forming the eastern arm of the U-shaped academic quad',
      'Cream sandstone facade with projecting vertical bay-window towers & stepped rooftop mechanical penthouses',
      'Central Library, Bloomberg Finance Lab, Lecture Theatres & Seminar Halls',
      'Overlooks the central green sports ground & curved amphitheater forecourt'
    ]
  },
  {
    id: 'dblock',
    code: 'BLOCK D',
    name: 'D Block',
    subtitle: 'Contemporary Curtain-Wall Academic, Innovation & Research Tower',
    floors: '6 Stories (G + 5)',
    area: '1,18,000 sq. ft.',
    anchor: [13, 18.5, -34],
    cameraPos: [13, 25, -4],
    cameraTarget: [13, 7, -34],
    highlights: [
      'Dark slate-blue reflective glass curtain wall (#263C47) with recessed double-height ground colonnade',
      'Cantilevered cream-grey portal frame (#D6D1C7) enclosing dense horizontal metal brise-soleil louvers',
      'Rooftop steel pergola railing & solar energy terrace',
      'Elevated vantage overlooking the central green ground and U-shaped A-B-C quad'
    ]
  },
  {
    id: 'hostels',
    code: 'RESIDENCES',
    name: 'Boys & Girls Hostels',
    subtitle: 'Twin North-South Residential Blocks & Dining Commons',
    floors: '7 Stories (G + 6) Twin Blocks',
    area: '1,65,000 sq. ft.',
    anchor: [-46.5, 19.5, -14],
    cameraPos: [-68, 28, 18],
    cameraTarget: [-46.5, 7, -14],
    highlights: [
      'Strictly aligned vertically along the North-South axis along the western campus flank',
      'Sleek cream-white architectural facades accented with vertical slate-teal stairwell glass bands',
      'Elevated enclosed skybridge linking North & South residential wings',
      'Rooftop solar water heaters & insulated overhead water tanks'
    ]
  },
  {
    id: 'sports',
    code: 'ATHLETICS',
    name: 'Sports Grounds & Central Field',
    subtitle: 'FIBA Basketball Courts, Turf Football Pitch & Central Quad Ground',
    floors: 'Outdoor Arenas',
    area: '1,45,000 sq. ft.',
    anchor: [-22, 4.5, 14],
    cameraPos: [-22, 34, 48],
    cameraTarget: [-22, 1, 14],
    highlights: [
      'Dual blue-and-green FIBA acrylic basketball courts with tempered glass backboards',
      'Striped natural turf football ground framed by a 4-lane terracotta athletics track & bleachers',
      'Central green sports & assembly ground between D Block and the A-B-C quad lined with university buses',
      'High-mast LED floodlights around the sports complex'
    ]
  },
  {
    id: 'entrance',
    code: 'MAIN GATE',
    name: 'Main Entrance',
    subtitle: 'Sohna Road Gatehouse, White Canopy Pavilion, Tiranga Flag & Parking',
    floors: 'Campus Plinth Forecourt',
    area: '88,000 sq. ft.',
    anchor: [13, 9.5, 36],
    cameraPos: [13, 18, 66],
    cameraTarget: [13, 3.5, 29],
    highlights: [
      'Prominent white pitched-roof entrance canopy pavilion directly in front of Aryabhata Block with K.R. MANGALAM UNIVERSITY signage & security reception kiosk',
      'Flanking terracotta brick portal piers & wrought-iron perimeter fencing along Sohna Road',
      'Central topiary median with tall flagpole flying the waving Indian National Flag (Tiranga) directly in front of the entrance canopy',
      'Dual interlocking paver parking plazas for cars, motorcycles, scooties & covered bicycle racks'
    ]
  }
];

const CAMERA_PRESETS: CameraPreset[] = [
  { id: 'overview', label: 'Establishing Overview', pos: [0, 66, 88], target: [0, 2, 0] },
  { id: 'aryabhata', label: 'Aryabhata & Main Gate', pos: [14, 22, 58], target: [13, 5, 20] },
  { id: 'dblock_view', label: 'D Block View (Quad)', pos: [13, 21, -24], target: [13, 6, 8] },
  { id: 'west', label: 'Hostels & Sports', pos: [-66, 32, 24], target: [-32, 4, -2] },
  { id: 'plan', label: 'Top-Down Plan', pos: [0, 112, 4], target: [0, 0, 0] }
];

function createCanvasTexture(
  drawFn: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
  width = 512,
  height = 512,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawFn(ctx, width, height);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  if (repeatX !== 1 || repeatY !== 1) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
  }
  tex.anisotropy = 4;
  return tex;
}

export interface KrmuCampusExplorerProps {
  onReportIssue?: (buildingName: string) => void;
  className?: string;
}

export function KrmuCampusExplorer({ onReportIssue, className = '' }: KrmuCampusExplorerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const labelRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const clickableMeshesRef = useRef<THREE.Mesh[]>([]);
  const buildingGroupsRef = useRef<Record<string, THREE.Group>>({});
  const animatedRefs = useRef<{
    flagMesh: THREE.Mesh | null;
    flagBasePositions: Float32Array | null;
    sunLight: THREE.DirectionalLight | null;
    hemiLight: THREE.HemisphereLight | null;
    fillLight: THREE.DirectionalLight | null;
    vehiclesGroup: THREE.Group | null;
    roofDetailsGroup: THREE.Group | null;
    camAnim: {
      targetPos: THREE.Vector3;
      targetLook: THREE.Vector3;
      progress: number;
    } | null;
  }>({
    flagMesh: null,
    flagBasePositions: null,
    sunLight: null,
    hemiLight: null,
    fillLight: null,
    vehiclesGroup: null,
    roofDetailsGroup: null,
    camAnim: null
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>('overview');
  const [lightingMode, setLightingMode] = useState<'day' | 'golden'>('day');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showVehiclesAndRoof, setShowVehiclesAndRoof] = useState<boolean>(true);

  // Ticketing Integration Modal State
  const [isTicketingOpen, setIsTicketingOpen] = useState<boolean>(false);

  const selectedBuilding = CAMPUS_DATA.find((b) => b.id === selectedId) || null;

  const flyTo = useCallback((pos: [number, number, number], target: [number, number, number], presetKey: string | null = null) => {
    if (presetKey) setActivePreset(presetKey);
    animatedRefs.current.camAnim = {
      targetPos: new THREE.Vector3(...pos),
      targetLook: new THREE.Vector3(...target),
      progress: 0
    };
  }, []);

  const handleSelectBuilding = useCallback(
    (id: string) => {
      setSelectedId(id);
      const b = CAMPUS_DATA.find((item) => item.id === id);
      if (b) {
        setActivePreset('');
        flyTo(b.cameraPos, b.cameraTarget);
      }
    },
    [flyTo]
  );

  const handleReportIssueClick = () => {
    if (!selectedBuilding) return;
    if (onReportIssue) {
      onReportIssue(selectedBuilding.name);
    }
    setIsTicketingOpen(true);
  };

  // Sync Lighting Mode
  useEffect(() => {
    const { sunLight, hemiLight, fillLight } = animatedRefs.current;
    if (!sunLight || !hemiLight || !fillLight) return;

    if (lightingMode === 'golden') {
      sunLight.color.set('#FDBA74');
      sunLight.intensity = 2.35;
      sunLight.position.set(58, 34, 42);
      hemiLight.color.set('#FEF3C7');
      hemiLight.groundColor.set('#94A3B8');
      hemiLight.intensity = 0.85;
      fillLight.color.set('#93C5FD');
      fillLight.intensity = 0.45;
    } else {
      sunLight.color.set('#FFFBEB');
      sunLight.intensity = 2.05;
      sunLight.position.set(44, 68, 48);
      hemiLight.color.set('#FFFFFF');
      hemiLight.groundColor.set('#CBD5E1');
      hemiLight.intensity = 1.05;
      fillLight.color.set('#E2E8F0');
      fillLight.intensity = 0.55;
    }
  }, [lightingMode]);

  // Sync Vehicles & Roof Details Toggle
  useEffect(() => {
    const { vehiclesGroup, roofDetailsGroup } = animatedRefs.current;
    if (vehiclesGroup) vehiclesGroup.visible = showVehiclesAndRoof;
    if (roofDetailsGroup) roofDetailsGroup.visible = showVehiclesAndRoof;
  }, [showVehiclesAndRoof]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Studio Background (Strictly #F1F5F9, no fog, no outer terrain)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F1F5F9');
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.5, 450);
    camera.position.set(0, 66, 88);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 2, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 14;
    controls.maxDistance = 160;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controlsRef.current = controls;

    const onControlStart = () => {
      animatedRefs.current.camAnim = null;
    };
    controls.addEventListener('start', onControlStart);

    // 5. Studio Architectural Lighting
    const hemiLight = new THREE.HemisphereLight('#FFFFFF', '#CBD5E1', 1.05);
    hemiLight.position.set(0, 80, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#FFFBEB', 2.05);
    sunLight.position.set(44, 68, 48);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 210;
    const d = 74;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight('#E2E8F0', 0.55);
    fillLight.position.set(-48, 36, -42);
    scene.add(fillLight);

    animatedRefs.current.sunLight = sunLight;
    animatedRefs.current.hemiLight = hemiLight;
    animatedRefs.current.fillLight = fillLight;

    // Shared Materials Palette
    const mats = {
      plinthBase: new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.7 }),
      plinthTrim: new THREE.MeshStandardMaterial({ color: '#CBD5E1', roughness: 0.55 }),
      plinthShadowBase: new THREE.MeshStandardMaterial({ color: '#94A3B8', roughness: 0.8 }),
      lawn: new THREE.MeshStandardMaterial({ color: '#659B5E', roughness: 0.88 }),
      lawnDark: new THREE.MeshStandardMaterial({ color: '#52834C', roughness: 0.9 }),
      asphalt: new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.85 }),
      paver: new THREE.MeshStandardMaterial({
        map: createCanvasTexture(
          (ctx, w, h) => {
            ctx.fillStyle = '#CBD5E1';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = '#94A3B8';
            ctx.lineWidth = 2;
            const step = 32;
            for (let y = 0; y < h; y += step) {
              ctx.beginPath();
              ctx.moveTo(0, y);
              ctx.lineTo(w, y);
              ctx.stroke();
              const offset = (y / step) % 2 === 0 ? 0 : step / 2;
              for (let x = offset; x < w; x += step) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + step);
                ctx.stroke();
              }
            }
          },
          256,
          256,
          14,
          10
        ),
        roughness: 0.8
      }),
      sidewalk: new THREE.MeshStandardMaterial({ color: '#F1F5F9', roughness: 0.65 }),
      granite: new THREE.MeshStandardMaterial({ color: '#94A3B8', roughness: 0.6 }),
      sandstone: new THREE.MeshStandardMaterial({ color: '#E8E1D3', roughness: 0.68 }),
      sandstoneTrim: new THREE.MeshStandardMaterial({ color: '#F5F0E6', roughness: 0.55 }),
      sandstoneDark: new THREE.MeshStandardMaterial({ color: '#D5CBB8', roughness: 0.72 }),
      terracotta: new THREE.MeshStandardMaterial({ color: '#B84A39', roughness: 0.62 }),
      whiteColumn: new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.45 }),
      domeWhite: new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.38, metalness: 0.05 }),
      glassClassical: new THREE.MeshStandardMaterial({
        color: '#2B4C65',
        roughness: 0.18,
        metalness: 0.55
      }),
      glassCourtyard: new THREE.MeshStandardMaterial({
        color: '#4E728A',
        roughness: 0.15,
        metalness: 0.62
      }),
      glassDBlock: new THREE.MeshStandardMaterial({
        color: '#263C47',
        roughness: 0.14,
        metalness: 0.72
      }),
      portalCream: new THREE.MeshStandardMaterial({ color: '#D6D1C7', roughness: 0.6 }),
      louverMetal: new THREE.MeshStandardMaterial({ color: '#64748B', roughness: 0.45, metalness: 0.5 }),
      hostelBody: new THREE.MeshStandardMaterial({ color: '#F3EFE6', roughness: 0.62 }),
      hostelSlate: new THREE.MeshStandardMaterial({ color: '#1E4658', roughness: 0.3, metalness: 0.5 }),
      roofSlab: new THREE.MeshStandardMaterial({ color: '#CBD5E1', roughness: 0.75 }),
      solarCell: new THREE.MeshStandardMaterial({
        map: createCanvasTexture(
          (ctx, w, h) => {
            ctx.fillStyle = '#1E3A5F';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = '#60A5FA';
            ctx.lineWidth = 2;
            for (let x = 0; x <= w; x += 32) {
              ctx.beginPath();
              ctx.moveTo(x, 0);
              ctx.lineTo(x, h);
              ctx.stroke();
            }
            for (let y = 0; y <= h; y += 64) {
              ctx.beginPath();
              ctx.moveTo(0, y);
              ctx.lineTo(w, y);
              ctx.stroke();
            }
          },
          256,
          256
        ),
        roughness: 0.25,
        metalness: 0.4
      }),
      busYellow: new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.32, metalness: 0.25 }),
      busStripe: new THREE.MeshStandardMaterial({ color: '#1E3A8A', roughness: 0.4 }),
      metalDark: new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.5, metalness: 0.6 }),
      metalSilver: new THREE.MeshStandardMaterial({ color: '#CBD5E1', roughness: 0.35, metalness: 0.75 }),
      treeFoliage1: new THREE.MeshStandardMaterial({ color: '#3F7D44', roughness: 0.85 }),
      treeFoliage2: new THREE.MeshStandardMaterial({ color: '#4E8D4E', roughness: 0.82 }),
      treeTrunk: new THREE.MeshStandardMaterial({ color: '#6B4F3A', roughness: 0.9 }),
      whiteLine: new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.5 }),
      glassTintMat: new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.12, metalness: 0.85 }),
      tireMat: new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.85 }),
      rimMat: new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.3, metalness: 0.8 }),
      headlightMat: new THREE.MeshStandardMaterial({ color: '#FEF9C3', emissive: '#FEF08A', emissiveIntensity: 0.35 }),
      taillightMat: new THREE.MeshStandardMaterial({ color: '#DC2626', emissive: '#991B1B', emissiveIntensity: 0.3 })
    };

    clickableMeshesRef.current = [];
    buildingGroupsRef.current = {};

    const vehiclesGroup = new THREE.Group();
    const roofDetailsGroup = new THREE.Group();
    animatedRefs.current.vehiclesGroup = vehiclesGroup;
    animatedRefs.current.roofDetailsGroup = roofDetailsGroup;

    const registerBuilding = (id: string, group: THREE.Group) => {
      buildingGroupsRef.current[id] = group;
      group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.userData.buildingId = id;
          clickableMeshesRef.current.push(mesh);
        }
      });
    };

    const makeBox = (w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0, cast = true, receive = true) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      m.castShadow = cast;
      m.receiveShadow = receive;
      return m;
    };

    // =========================================================================
    // Helper: Classical Ribbed Dome Builder
    // =========================================================================
    const createRibbedDome = (radius: number, drumHeight: number, domeHeight: number) => {
      const g = new THREE.Group();
      const drum = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.96, radius * 1.02, drumHeight, 24),
        mats.sandstoneTrim
      );
      drum.position.y = drumHeight / 2;
      drum.castShadow = true;
      drum.receiveShadow = true;
      g.add(drum);

      const cornice = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 1.08, radius * 1.04, 0.28, 24),
        mats.whiteColumn
      );
      cornice.position.y = drumHeight;
      g.add(cornice);

      const winCount = 8;
      for (let i = 0; i < winCount; i++) {
        const a = (i / winCount) * Math.PI * 2;
        const win = new THREE.Mesh(
          new THREE.BoxGeometry(radius * 0.34, drumHeight * 0.56, 0.16),
          mats.glassClassical
        );
        win.position.set(Math.sin(a) * radius * 0.94, drumHeight * 0.48, Math.cos(a) * radius * 0.94);
        win.rotation.y = a;
        g.add(win);
      }

      const domeGeo = new THREE.SphereGeometry(radius, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.52);
      domeGeo.scale(1, domeHeight / radius, 1);
      const dome = new THREE.Mesh(domeGeo, mats.domeWhite);
      dome.position.y = drumHeight + 0.08;
      dome.castShadow = true;
      g.add(dome);

      const ribCount = 12;
      for (let i = 0; i < ribCount; i++) {
        const a = (i / ribCount) * Math.PI * 2;
        const ribGeo = new THREE.TorusGeometry(radius * 1.005, 0.055, 6, 18, Math.PI * 0.5);
        ribGeo.scale(1, domeHeight / radius, 1);
        const rib = new THREE.Mesh(ribGeo, mats.sandstoneTrim);
        rib.position.y = drumHeight + 0.08;
        rib.rotation.y = a;
        g.add(rib);
      }

      const lantern = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.16, radius * 0.2, 0.65, 12),
        mats.whiteColumn
      );
      lantern.position.y = drumHeight + domeHeight + 0.25;
      g.add(lantern);

      const spire = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.08, 0.95, 10), mats.domeWhite);
      spire.position.y = drumHeight + domeHeight + 0.95;
      g.add(spire);

      return g;
    };

    // Helper: Solar Panel Array Builder
    const addSolarArray = (parent: THREE.Group, centerX: number, y: number, centerZ: number, rows: number, cols: number, tilt = 0.22) => {
      const arrayGroup = new THREE.Group();
      arrayGroup.position.set(centerX, y, centerZ);
      const pw = 1.55;
      const pd = 0.95;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = (c - (cols - 1) / 2) * (pw + 0.24);
          const pz = (r - (rows - 1) / 2) * (pd + 0.42);
          const panel = new THREE.Mesh(new THREE.BoxGeometry(pw, 0.08, pd), mats.solarCell);
          panel.position.set(px, 0.24, pz);
          panel.rotation.x = tilt;
          panel.castShadow = true;
          arrayGroup.add(panel);

          const stand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.24, 0.12), mats.metalSilver);
          stand.position.set(px, 0.12, pz - 0.18);
          arrayGroup.add(stand);
        }
      }
      roofDetailsGroup.add(arrayGroup);
      const worldOffset = new THREE.Vector3();
      parent.updateMatrixWorld(true);
      parent.getWorldPosition(worldOffset);
      arrayGroup.position.add(worldOffset);
    };

    // Helper: HVAC Chiller Unit
    const addHvacUnit = (parent: THREE.Group, x: number, y: number, z: number) => {
      const g = new THREE.Group();
      const worldOffset = new THREE.Vector3();
      parent.updateMatrixWorld(true);
      parent.getWorldPosition(worldOffset);
      g.position.set(worldOffset.x + x, worldOffset.y + y, worldOffset.z + z);
      g.add(makeBox(1.5, 0.95, 1.1, mats.metalSilver, 0, 0.475, 0, true, true));
      const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.08, 16), mats.metalDark);
      fan.position.set(-0.35, 0.97, 0);
      g.add(fan);
      const fan2 = fan.clone();
      fan2.position.set(0.35, 0.97, 0);
      g.add(fan2);
      roofDetailsGroup.add(g);
    };

    // =========================================================================
    // 1. ARCHITECTURAL SCALE-MODEL PLINTH (120 x 96 units)
    // =========================================================================
    const plinthGroup = new THREE.Group();

    plinthGroup.add(makeBox(118.4, 1.0, 94.4, mats.plinthShadowBase, 0, -1.7, 0, false, false));
    plinthGroup.add(makeBox(120, 1.2, 96, mats.plinthBase, 0, -0.6, 0, false, true));
    plinthGroup.add(makeBox(120.4, 0.35, 0.6, mats.plinthTrim, 0, 0.05, 48.0, false, true));
    plinthGroup.add(makeBox(120.4, 0.35, 0.6, mats.plinthTrim, 0, 0.05, -48.0, false, true));
    plinthGroup.add(makeBox(0.6, 0.35, 96.4, mats.plinthTrim, -60.0, 0.05, 0, false, true));
    plinthGroup.add(makeBox(0.6, 0.35, 96.4, mats.plinthTrim, 60.0, 0.05, 0, false, true));

    // Campus Lawn Surface inside Plinth (118 x 94)
    plinthGroup.add(makeBox(118, 0.12, 94, mats.lawn, 0, 0.06, 0, false, true));

    // Central Green Sports & Assembly Ground between D Block and A-B-C Quad
    const centralFieldTex = createCanvasTexture(
      (ctx, w, h) => {
        ctx.fillStyle = '#589448';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#629F51';
        for (let y = 0; y < h; y += 32) {
          ctx.fillRect(0, y, w, 16);
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.68)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.42, 48, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(24, h * 0.42);
        ctx.lineTo(w - 24, h * 0.42);
        ctx.stroke();
      },
      512,
      512
    );
    const centralField = new THREE.Mesh(
      new THREE.BoxGeometry(24.5, 0.14, 18.0),
      new THREE.MeshStandardMaterial({ map: centralFieldTex, roughness: 0.88 })
    );
    centralField.position.set(13, 0.07, -14.5);
    centralField.receiveShadow = true;
    plinthGroup.add(centralField);

    // Internal Campus Bus & Pedestrian Ring Roads around Central Ground
    plinthGroup.add(makeBox(36.0, 0.15, 2.8, mats.sidewalk, 13, 0.075, -5.0, false, true));
    plinthGroup.add(makeBox(36.0, 0.15, 2.8, mats.sidewalk, 13, 0.075, -24.5, false, true));
    plinthGroup.add(makeBox(2.8, 0.15, 22.0, mats.sidewalk, -1.5, 0.075, -14.8, false, true));
    plinthGroup.add(makeBox(2.8, 0.15, 22.0, mats.sidewalk, 27.5, 0.075, -14.8, false, true));

    // Promenade linking West (Hostels/Sports) to East Academic Quad
    plinthGroup.add(makeBox(108, 0.16, 4.2, mats.sidewalk, 0, 0.08, 22.5, false, true));
    plinthGroup.add(makeBox(3.4, 0.16, 82, mats.sidewalk, -34.0, 0.08, -2, false, true));
    plinthGroup.add(makeBox(114, 0.15, 2.2, mats.sidewalk, 0, 0.075, -44.5, false, true));
    plinthGroup.add(makeBox(2.2, 0.15, 88, mats.sidewalk, 55.5, 0.075, -1, false, true));

    // Wrought-iron perimeter fencing along South & Plinth borders
    const buildFenceRun = (x1: number, z1: number, x2: number, z2: number) => {
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);
      const fence = new THREE.Group();
      fence.position.set((x1 + x2) / 2, 0.12, (z1 + z2) / 2);
      fence.rotation.y = angle;

      fence.add(makeBox(0.32, 0.55, len, mats.sandstoneDark, 0, 0.275, 0, true, true));
      fence.add(makeBox(0.08, 0.08, len, mats.metalDark, 0, 1.35, 0, false, false));
      fence.add(makeBox(0.08, 0.08, len, mats.metalDark, 0, 0.65, 0, false, false));

      const posts = Math.max(2, Math.floor(len / 2.2));
      for (let i = 0; i <= posts; i++) {
        const pz = -len / 2 + (len * i) / posts;
        const isPillar = i % 4 === 0 || i === posts;
        if (isPillar) {
          fence.add(makeBox(0.42, 1.55, 0.42, mats.sandstone, 0, 0.775, pz, true, true));
          fence.add(makeBox(0.5, 0.12, 0.5, mats.terracotta, 0, 1.58, pz, true, true));
        } else {
          fence.add(makeBox(0.06, 0.85, 0.06, mats.metalDark, 0, 0.98, pz, false, false));
        }
      }
      plinthGroup.add(fence);
    };

    buildFenceRun(-58.5, 45.8, 5.6, 45.8);
    buildFenceRun(20.4, 45.8, 58.5, 45.8);
    buildFenceRun(-58.5, -46.5, -58.5, 45.8);
    buildFenceRun(58.5, -46.5, 58.5, 45.8);
    buildFenceRun(-58.5, -46.5, 58.5, -46.5);

    scene.add(plinthGroup);

    // =========================================================================
    // 2. ARYABHATA BLOCK (BLOCK A)
    // =========================================================================
    const aryabhataGroup = new THREE.Group();
    aryabhataGroup.position.set(13, 0.16, 13);

    aryabhataGroup.add(makeBox(30.4, 0.7, 13.6, mats.granite, 0, 0.35, 0, true, true));

    // Wide Stepped Granite Entrance Stairs (South Front)
    for (let s = 0; s < 5; s++) {
      aryabhataGroup.add(
        makeBox(11.6 - s * 0.2, 0.14, 2.6 - s * 0.38, mats.granite, 0, 0.07 + s * 0.14, 7.4 - s * 0.15, true, true)
      );
    }

    const aryaH = 11.4;
    const aryaBaseY = 0.7;
    aryabhataGroup.add(makeBox(29.0, aryaH, 12.2, mats.sandstone, 0, aryaBaseY + aryaH / 2, 0, true, true));

    // Projecting end pavilions (left & right shoulders)
    aryabhataGroup.add(makeBox(6.6, aryaH + 0.3, 12.8, mats.sandstone, -11.2, aryaBaseY + (aryaH + 0.3) / 2, 0, true, true));
    aryabhataGroup.add(makeBox(6.6, aryaH + 0.3, 12.8, mats.sandstone, 11.2, aryaBaseY + (aryaH + 0.3) / 2, 0, true, true));

    // Horizontal Classical Cornice Stringcourses
    for (let f = 1; f <= 5; f++) {
      const cy = aryaBaseY + f * 2.24;
      aryabhataGroup.add(makeBox(29.5, 0.22, 13.1, mats.sandstoneTrim, 0, cy, 0, true, true));
    }

    // Ground-Floor White Colonnade Pillars along South Facade
    for (let cx = -13.6; cx <= 13.6; cx += 2.26) {
      if (Math.abs(cx) < 4.8) continue;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 2.2, 14), mats.whiteColumn);
      col.position.set(cx, aryaBaseY + 1.1, 6.35);
      col.castShadow = true;
      aryabhataGroup.add(col);
    }

    // Punched Classical Window Grids
    for (let f = 0; f < 5; f++) {
      const wy = aryaBaseY + 1.15 + f * 2.24;
      for (let wx = -13.2; wx <= 13.2; wx += 2.2) {
        if (f === 0 && Math.abs(wx) < 5.0) continue;
        if (f === 1 && Math.abs(wx) < 4.5) continue;
        aryabhataGroup.add(makeBox(1.18, 1.38, 0.18, mats.sandstoneTrim, wx, wy, 6.42, false, false));
        aryabhataGroup.add(makeBox(0.96, 1.18, 0.22, mats.glassClassical, wx, wy, 6.44, false, false));
        if (Math.abs(wx) > 5.4) {
          aryabhataGroup.add(makeBox(0.96, 1.18, 0.2, mats.glassClassical, wx, wy, -6.42, false, false));
        }
      }
      for (let wz = -4.6; wz <= 4.6; wz += 2.3) {
        aryabhataGroup.add(makeBox(0.2, 1.18, 1.0, mats.glassClassical, -14.55, wy, wz, false, false));
        aryabhataGroup.add(makeBox(0.2, 1.18, 1.0, mats.glassClassical, 14.55, wy, wz, false, false));
      }
    }

    // SOUTH FRONT: Double-Height Classical Portico with 4 Fluted Columns & Terracotta Pediment
    aryabhataGroup.add(makeBox(7.6, 3.9, 0.3, mats.glassClassical, 0, aryaBaseY + 1.95, 6.15, false, false));
    const porticoZ = 7.55;
    aryabhataGroup.add(makeBox(9.6, 0.36, 2.9, mats.sandstoneTrim, 0, aryaBaseY + 4.55, 6.8, true, true));
    [-3.9, -1.3, 1.3, 3.9].forEach((cx) => {
      aryabhataGroup.add(makeBox(0.76, 0.45, 0.76, mats.whiteColumn, cx, aryaBaseY + 0.225, porticoZ, true, true));
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 3.85, 16), mats.whiteColumn);
      shaft.position.set(cx, aryaBaseY + 2.35, porticoZ);
      shaft.castShadow = true;
      aryabhataGroup.add(shaft);
      aryabhataGroup.add(makeBox(0.82, 0.28, 0.82, mats.whiteColumn, cx, aryaBaseY + 4.38, porticoZ, true, true));
    });

    const pedShape = new THREE.Shape();
    pedShape.moveTo(-5.1, 0);
    pedShape.lineTo(5.1, 0);
    pedShape.lineTo(0, 2.25);
    pedShape.closePath();
    const pedGeo = new THREE.ExtrudeGeometry(pedShape, {
      depth: 2.6,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 2
    });
    const pediment = new THREE.Mesh(pedGeo, mats.terracotta);
    pediment.position.set(0, aryaBaseY + 4.75, 5.55);
    pediment.castShadow = true;
    aryabhataGroup.add(pediment);
    aryabhataGroup.add(makeBox(10.5, 0.22, 2.9, mats.whiteColumn, 0, aryaBaseY + 4.72, 6.95, true, true));

    // NORTH COURTYARD ELEVATION:
    // Full-Height Blue-Grey Glass Curtain Wall Atrium + White Glazed Ground Podium + 6-Column Portico
    const northAtriumW = 10.6;
    aryabhataGroup.add(makeBox(northAtriumW, aryaH, 0.35, mats.glassCourtyard, 0, aryaBaseY + aryaH / 2, -6.15, false, false));
    for (let fy = 1; fy <= 5; fy++) {
      aryabhataGroup.add(makeBox(northAtriumW + 0.1, 0.12, 0.42, mats.sandstoneTrim, 0, aryaBaseY + fy * 2.24, -6.18, false, false));
    }
    for (let mx = -5.0; mx <= 5.0; mx += 2.0) {
      aryabhataGroup.add(makeBox(0.1, aryaH, 0.42, mats.sandstoneTrim, mx, aryaBaseY + aryaH / 2, -6.18, false, false));
    }

    // White Glazed Ground-Floor Colonnade Podium Terrace projecting into North Courtyard
    const podiumW = 10.8;
    const podiumD = 2.4;
    const podiumH = 2.15;
    aryabhataGroup.add(makeBox(podiumW, podiumH, podiumD, mats.whiteColumn, 0, aryaBaseY + podiumH / 2, -6.2 - podiumD / 2, true, true));
    aryabhataGroup.add(makeBox(podiumW - 0.5, podiumH - 0.45, podiumD + 0.08, mats.glassClassical, 0, aryaBaseY + podiumH / 2, -6.2 - podiumD / 2, false, false));
    for (let px = -5.1; px <= 5.1; px += 1.02) {
      aryabhataGroup.add(makeBox(0.14, podiumH, 0.16, mats.whiteColumn, px, aryaBaseY + podiumH / 2, -6.2 - podiumD - 0.04, false, false));
    }

    // 6 Tall Classical Columns standing on the North Podium Terrace supporting a Cream Triangular Pediment
    const nColZ = -6.2 - podiumD + 0.35;
    const nColBaseY = aryaBaseY + podiumH;
    const nColH = 6.25;
    [-4.6, -2.76, -0.92, 0.92, 2.76, 4.6].forEach((cx) => {
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, nColH, 14), mats.whiteColumn);
      shaft.position.set(cx, nColBaseY + nColH / 2, nColZ);
      shaft.castShadow = true;
      aryabhataGroup.add(shaft);
    });
    aryabhataGroup.add(makeBox(10.6, 0.34, 2.3, mats.sandstoneTrim, 0, nColBaseY + nColH + 0.15, -6.2 - podiumD / 2, true, true));
    const nPedShape = new THREE.Shape();
    nPedShape.moveTo(-5.2, 0);
    nPedShape.lineTo(5.2, 0);
    nPedShape.lineTo(0, 1.95);
    nPedShape.closePath();
    const nPedGeo = new THREE.ExtrudeGeometry(nPedShape, {
      depth: 2.2,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 2
    });
    const nPediment = new THREE.Mesh(nPedGeo, mats.sandstoneTrim);
    nPediment.position.set(0, nColBaseY + nColH + 0.32, -6.2 - podiumD + 0.05);
    nPediment.castShadow = true;
    aryabhataGroup.add(nPediment);

    // North Courtyard Curved Serpentine Paved & Lawn Amphitheater Forecourt
    const northForecourtTex = createCanvasTexture(
      (ctx, w, h) => {
        ctx.fillStyle = '#5B964E';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 22;
        ctx.beginPath();
        ctx.moveTo(w * 0.5, 0);
        ctx.bezierCurveTo(w * 0.22, h * 0.35, w * 0.78, h * 0.65, w * 0.45, h);
        ctx.stroke();

        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.12, 130, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.12, 210, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      },
      512,
      384
    );
    const northForecourt = new THREE.Mesh(
      new THREE.BoxGeometry(17.5, 0.16, 11.2),
      new THREE.MeshStandardMaterial({ map: northForecourtTex, roughness: 0.82 })
    );
    northForecourt.position.set(0, 0.02, -12.0);
    northForecourt.receiveShadow = true;
    aryabhataGroup.add(northForecourt);

    aryabhataGroup.add(makeBox(11.4, 0.55, 0.65, mats.lawnDark, 0, 0.275, -17.3, true, true));
    const centerPlanter = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.5, 0.32, 20), mats.sandstoneTrim);
    centerPlanter.position.set(0, 0.16, -12.2);
    aryabhataGroup.add(centerPlanter);

    // Rooftop Parapet & 5 White Ribbed Domes
    const aryaRoofY = aryaBaseY + aryaH + 0.3;
    aryabhataGroup.add(makeBox(29.4, 0.65, 13.0, mats.sandstoneTrim, 0, aryaRoofY + 0.32, 0, true, true));
    aryabhataGroup.add(makeBox(29.6, 0.22, 13.2, mats.terracotta, 0, aryaRoofY + 0.68, 0, false, false));

    const mainDome = createRibbedDome(2.45, 1.55, 2.65);
    mainDome.position.set(0, aryaRoofY + 0.4, 0);
    aryabhataGroup.add(mainDome);

    [
      [-11.2, -3.8],
      [11.2, -3.8],
      [-11.2, 3.8],
      [11.2, 3.8]
    ].forEach(([dx, dz]) => {
      const sd = createRibbedDome(1.22, 0.95, 1.38);
      sd.position.set(dx, aryaRoofY + 0.4, dz);
      aryabhataGroup.add(sd);
    });

    registerBuilding('aryabhata', aryabhataGroup);
    scene.add(aryabhataGroup);

    addSolarArray(aryabhataGroup, -6.2, aryaRoofY + 0.4, -2.8, 2, 3);
    addSolarArray(aryabhataGroup, 6.2, aryaRoofY + 0.4, -2.8, 2, 3);
    addHvacUnit(aryabhataGroup, -6.2, aryaRoofY + 0.4, 3.0);
    addHvacUnit(aryabhataGroup, 6.2, aryaRoofY + 0.4, 3.0);

    // =========================================================================
    // 3. BHASKARACHARYA BLOCK (BLOCK B)
    // =========================================================================
    const bhaskaraGroup = new THREE.Group();
    bhaskaraGroup.position.set(-3.5, 0.16, -1.5);

    const wingH = 11.2;
    const wingW = 8.4;
    const wingD = 17.5;

    bhaskaraGroup.add(makeBox(wingW, wingH, wingD, mats.sandstone, 0, wingH / 2, 0, true, true));

    // Protruding Vertical Bay-Window Towers
    bhaskaraGroup.add(makeBox(3.4, wingH + 1.4, 3.8, mats.sandstoneTrim, -1.6, (wingH + 1.4) / 2, -wingD / 2 + 1.2, true, true));
    bhaskaraGroup.add(makeBox(2.2, wingH + 0.8, 3.4, mats.sandstoneTrim, wingW / 2 + 0.8, (wingH + 0.8) / 2, -4.6, true, true));
    bhaskaraGroup.add(makeBox(2.2, wingH + 0.8, 3.4, mats.sandstoneTrim, wingW / 2 + 0.8, (wingH + 0.8) / 2, 1.8, true, true));

    for (let f = 1; f <= 5; f++) {
      const cy = f * 2.22;
      bhaskaraGroup.add(makeBox(wingW + 0.3, 0.18, wingD + 0.3, mats.sandstoneTrim, 0, cy, 0, false, true));
    }

    for (let f = 0; f < 5; f++) {
      const wy = 1.12 + f * 2.22;
      for (let wz = -7.2; wz <= 7.2; wz += 2.2) {
        bhaskaraGroup.add(makeBox(0.18, 1.22, 1.05, mats.glassClassical, -wingW / 2 - 0.04, wy, wz, false, false));
        bhaskaraGroup.add(makeBox(0.18, 1.22, 1.05, mats.glassClassical, wingW / 2 + 0.04, wy, wz, false, false));
      }
      [-2.2, 0.2, 2.4].forEach((wx) => {
        bhaskaraGroup.add(makeBox(1.15, 1.22, 0.18, mats.glassClassical, wx, wy, -wingD / 2 - 0.72, false, false));
      });
      bhaskaraGroup.add(makeBox(0.2, 1.15, 2.4, mats.glassClassical, wingW / 2 + 1.92, wy, -4.6, false, false));
      bhaskaraGroup.add(makeBox(0.2, 1.15, 2.4, mats.glassClassical, wingW / 2 + 1.92, wy, 1.8, false, false));
    }

    bhaskaraGroup.add(makeBox(wingW + 0.4, 0.5, wingD + 0.4, mats.sandstoneTrim, 0, wingH + 0.25, 0, true, true));
    bhaskaraGroup.add(makeBox(3.6, 1.8, 3.8, mats.sandstoneTrim, -1.6, wingH + 1.6, -wingD / 2 + 1.2, true, true));

    registerBuilding('bhaskaracharya', bhaskaraGroup);
    scene.add(bhaskaraGroup);

    addSolarArray(bhaskaraGroup, 0.8, wingH + 0.45, -1.5, 3, 2);
    addSolarArray(bhaskaraGroup, 0.8, wingH + 0.45, 4.5, 2, 2);
    addHvacUnit(bhaskaraGroup, -1.5, wingH + 0.45, 3.5);

    // =========================================================================
    // 4. CHANAKYA BLOCK (BLOCK C)
    // =========================================================================
    const chanakyaGroup = new THREE.Group();
    chanakyaGroup.position.set(29.5, 0.16, -1.5);

    chanakyaGroup.add(makeBox(wingW, wingH, wingD, mats.sandstone, 0, wingH / 2, 0, true, true));

    chanakyaGroup.add(makeBox(3.4, wingH + 1.6, 3.8, mats.sandstoneTrim, 1.6, (wingH + 1.6) / 2, -wingD / 2 + 1.2, true, true));
    chanakyaGroup.add(makeBox(2.2, wingH + 0.8, 3.4, mats.sandstoneTrim, -wingW / 2 - 0.8, (wingH + 0.8) / 2, -4.6, true, true));
    chanakyaGroup.add(makeBox(2.2, wingH + 0.8, 3.4, mats.sandstoneTrim, -wingW / 2 - 0.8, (wingH + 0.8) / 2, 1.8, true, true));

    for (let f = 1; f <= 5; f++) {
      const cy = f * 2.22;
      chanakyaGroup.add(makeBox(wingW + 0.3, 0.18, wingD + 0.3, mats.sandstoneTrim, 0, cy, 0, false, true));
    }

    for (let f = 0; f < 5; f++) {
      const wy = 1.12 + f * 2.22;
      for (let wz = -7.2; wz <= 7.2; wz += 2.2) {
        chanakyaGroup.add(makeBox(0.18, 1.22, 1.05, mats.glassClassical, -wingW / 2 - 0.04, wy, wz, false, false));
        chanakyaGroup.add(makeBox(0.18, 1.22, 1.05, mats.glassClassical, wingW / 2 + 0.04, wy, wz, false, false));
      }
      [-2.4, -0.2, 2.2].forEach((wx) => {
        chanakyaGroup.add(makeBox(1.15, 1.22, 0.18, mats.glassClassical, wx, wy, -wingD / 2 - 0.72, false, false));
      });
      chanakyaGroup.add(makeBox(0.2, 1.15, 2.4, mats.glassClassical, -wingW / 2 - 1.92, wy, -4.6, false, false));
      chanakyaGroup.add(makeBox(0.2, 1.15, 2.4, mats.glassClassical, -wingW / 2 - 1.92, wy, 1.8, false, false));
    }

    chanakyaGroup.add(makeBox(wingW + 0.4, 0.5, wingD + 0.4, mats.sandstoneTrim, 0, wingH + 0.25, 0, true, true));
    chanakyaGroup.add(makeBox(3.6, 2.0, 3.8, mats.sandstoneTrim, 1.6, wingH + 1.7, -wingD / 2 + 1.2, true, true));

    registerBuilding('chanakya', chanakyaGroup);
    scene.add(chanakyaGroup);

    addSolarArray(chanakyaGroup, -0.8, wingH + 0.45, -1.5, 3, 2);
    addSolarArray(chanakyaGroup, -0.8, wingH + 0.45, 4.5, 2, 2);
    addHvacUnit(chanakyaGroup, 1.5, wingH + 0.45, 3.5);

    // =========================================================================
    // 5. D BLOCK (Rear Center)
    // =========================================================================
    const dBlockGroup = new THREE.Group();
    dBlockGroup.position.set(13, 0.16, -34);

    const dW = 24.0;
    const dD = 12.6;
    const dTotalH = 15.0;
    const gColonnadeH = 4.2;

    dBlockGroup.add(makeBox(dW + 1.2, 0.45, dD + 1.2, mats.granite, 0, 0.225, 0, true, true));
    dBlockGroup.add(makeBox(dW - 3.2, gColonnadeH, dD - 3.0, mats.glassDBlock, 0, 0.45 + gColonnadeH / 2, 0, true, true));
    for (let px = -dW / 2 + 0.7; px <= dW / 2 - 0.7; px += 2.8) {
      dBlockGroup.add(makeBox(0.55, gColonnadeH, 0.55, mats.portalCream, px, 0.45 + gColonnadeH / 2, dD / 2 - 0.5, true, true));
      dBlockGroup.add(makeBox(0.55, gColonnadeH, 0.55, mats.portalCream, px, 0.45 + gColonnadeH / 2, -dD / 2 + 0.5, true, true));
    }

    const upperH = dTotalH - gColonnadeH;
    const upperCenterY = 0.45 + gColonnadeH + upperH / 2;
    dBlockGroup.add(makeBox(dW, upperH, dD, mats.glassDBlock, 0, upperCenterY, 0, true, true));

    for (let fy = 0; fy <= 5; fy++) {
      const ty = 0.45 + gColonnadeH + (upperH * fy) / 5;
      dBlockGroup.add(makeBox(dW + 0.12, 0.14, dD + 0.12, mats.metalDark, 0, ty, 0, false, false));
    }
    for (let mx = -dW / 2; mx <= dW / 2; mx += 1.5) {
      dBlockGroup.add(makeBox(0.08, upperH, dD + 0.1, mats.metalDark, mx, upperCenterY, 0, false, false));
    }

    // Cantilevered Cream-Grey Portal Frame enclosing Horizontal Metal Brise-Soleil Louvers
    const portalW = 14.8;
    const portalH = upperH + 0.7;
    const portalD = 1.9;
    const portalZ = dD / 2 + 0.55;
    const portalBaseY = 0.45 + gColonnadeH - 0.2;

    dBlockGroup.add(makeBox(portalW, 0.65, portalD, mats.portalCream, 0, portalBaseY + 0.325, portalZ, true, true));
    dBlockGroup.add(makeBox(portalW, 0.75, portalD, mats.portalCream, 0, portalBaseY + portalH - 0.375, portalZ, true, true));
    dBlockGroup.add(makeBox(0.85, portalH, portalD, mats.portalCream, -portalW / 2 + 0.425, portalBaseY + portalH / 2, portalZ, true, true));
    dBlockGroup.add(makeBox(0.85, portalH, portalD, mats.portalCream, portalW / 2 - 0.425, portalBaseY + portalH / 2, portalZ, true, true));

    const louverInnerW = portalW - 1.7;
    const louverCount = 24;
    for (let i = 1; i < louverCount; i++) {
      const ly = portalBaseY + 0.65 + ((portalH - 1.4) * i) / louverCount;
      const louver = makeBox(louverInnerW, 0.08, 0.72, mats.louverMetal, 0, ly, portalZ + 0.12, true, false);
      louver.rotation.x = 0.28;
      dBlockGroup.add(louver);
    }
    [-4.2, 0, 4.2].forEach((fx) => {
      dBlockGroup.add(makeBox(0.12, portalH - 1.3, 0.85, mats.metalDark, fx, portalBaseY + portalH / 2, portalZ + 0.05, false, false));
    });

    // Rooftop Steel Pergola Railing
    const dRoofY = 0.45 + dTotalH;
    dBlockGroup.add(makeBox(dW + 0.3, 0.35, dD + 0.3, mats.roofSlab, 0, dRoofY + 0.175, 0, true, true));
    const pergH = 1.25;
    dBlockGroup.add(makeBox(dW, 0.12, 0.12, mats.metalDark, 0, dRoofY + 0.35 + pergH, dD / 2 - 0.2, false, false));
    dBlockGroup.add(makeBox(dW, 0.12, 0.12, mats.metalDark, 0, dRoofY + 0.35 + pergH, -dD / 2 + 0.2, false, false));
    dBlockGroup.add(makeBox(0.12, 0.12, dD, mats.metalDark, -dW / 2 + 0.2, dRoofY + 0.35 + pergH, 0, false, false));
    dBlockGroup.add(makeBox(0.12, 0.12, dD, mats.metalDark, dW / 2 - 0.2, dRoofY + 0.35 + pergH, 0, false, false));
    for (let rx = -dW / 2 + 0.4; rx <= dW / 2 - 0.4; rx += 2.4) {
      dBlockGroup.add(makeBox(0.1, pergH, 0.1, mats.metalDark, rx, dRoofY + 0.35 + pergH / 2, dD / 2 - 0.2, false, false));
      dBlockGroup.add(makeBox(0.1, pergH, 0.1, mats.metalDark, rx, dRoofY + 0.35 + pergH / 2, -dD / 2 + 0.2, false, false));
      dBlockGroup.add(makeBox(0.1, 0.14, dD - 0.4, mats.metalDark, rx, dRoofY + 0.35 + pergH, 0, false, false));
    }

    registerBuilding('dblock', dBlockGroup);
    scene.add(dBlockGroup);

    addSolarArray(dBlockGroup, -5.5, dRoofY + 0.35, 0, 2, 4);
    addSolarArray(dBlockGroup, 5.5, dRoofY + 0.35, 0, 2, 4);

    // =========================================================================
    // 6. BOYS & GIRLS HOSTELS (Western Flank)
    // =========================================================================
    const hostelGroup = new THREE.Group();
    hostelGroup.position.set(-46.5, 0.16, -14);

    const buildHostelBlock = (zCenter: number) => {
      const tGroup = new THREE.Group();
      tGroup.position.set(0, 0, zCenter);
      const tW = 11.4;
      const tD = 22.8;
      const tH = 15.8;

      tGroup.add(makeBox(tW, tH, tD, mats.hostelBody, 0, tH / 2, 0, true, true));

      // Vertical Slate-Teal Stairwell Glass Bands & Terracotta Accents
      [-6.8, 6.8].forEach((sz) => {
        tGroup.add(makeBox(0.32, tH + 0.2, 1.65, mats.hostelSlate, tW / 2 + 0.12, tH / 2, sz, true, true));
        tGroup.add(makeBox(0.32, tH + 0.2, 1.65, mats.hostelSlate, -tW / 2 - 0.12, tH / 2, sz, true, true));
      });
      tGroup.add(makeBox(0.28, tH, 0.9, mats.terracotta, tW / 2 + 0.08, tH / 2, 0, true, true));
      tGroup.add(makeBox(0.28, tH, 0.9, mats.terracotta, -tW / 2 - 0.08, tH / 2, 0, true, true));

      for (let f = 0; f < 7; f++) {
        const fy = 0.2 + f * 2.22;
        tGroup.add(makeBox(tW + 0.8, 0.18, tD + 0.3, mats.sandstoneTrim, 0, fy, 0, true, true));

        [-9.6, -3.4, 3.4, 9.6].forEach((bz) => {
          tGroup.add(makeBox(0.16, 1.45, 2.8, mats.glassClassical, tW / 2 + 0.02, fy + 0.95, bz, false, false));
          tGroup.add(makeBox(0.16, 1.45, 2.8, mats.glassClassical, -tW / 2 - 0.02, fy + 0.95, bz, false, false));
          tGroup.add(makeBox(0.14, 0.72, 3.2, mats.whiteColumn, tW / 2 + 0.36, fy + 0.45, bz, true, true));
          tGroup.add(makeBox(0.14, 0.72, 3.2, mats.whiteColumn, -tW / 2 - 0.36, fy + 0.45, bz, true, true));
        });
      }

      tGroup.add(makeBox(tW + 0.5, 0.55, tD + 0.5, mats.sandstoneTrim, 0, tH + 0.275, 0, true, true));
      [-6.8, 6.8].forEach((tz) => {
        tGroup.add(makeBox(3.4, 2.0, 3.2, mats.hostelBody, 0, tH + 1.0, tz, true, true));
        [-1.6, 1.6].forEach((tx) => {
          const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.55, 16), mats.whiteColumn);
          tank.position.set(tx, tH + 1.05, tz + (tz > 0 ? -2.8 : 2.8));
          tank.castShadow = true;
          tGroup.add(tank);
        });
      });

      return tGroup;
    };

    hostelGroup.add(buildHostelBlock(-14.2));
    hostelGroup.add(buildHostelBlock(14.2));

    // Central Covered Link Bridge
    const bridgeLen = 5.6;
    hostelGroup.add(makeBox(5.2, 4.4, bridgeLen, mats.hostelBody, 0, 7.8, 0, true, true));
    hostelGroup.add(makeBox(5.5, 0.35, bridgeLen, mats.hostelSlate, 0, 10.1, 0, true, true));
    hostelGroup.add(makeBox(5.32, 1.35, 3.6, mats.glassClassical, 0, 6.7, 0, false, false));
    hostelGroup.add(makeBox(5.32, 1.35, 3.6, mats.glassClassical, 0, 8.9, 0, false, false));
    [-1.9, 1.9].forEach((bx) => {
      hostelGroup.add(makeBox(0.55, 5.6, 0.55, mats.sandstoneTrim, bx, 2.8, 0, true, true));
    });

    registerBuilding('hostels', hostelGroup);
    scene.add(hostelGroup);

    // =========================================================================
    // 7. SPORTS GROUNDS (East of Hostels)
    // =========================================================================
    const sportsGroup = new THREE.Group();
    sportsGroup.position.set(-22, 0.14, 14);

    const buildBasketballCourt = (cx: number, cz: number) => {
      const cGroup = new THREE.Group();
      cGroup.position.set(cx, 0, cz);

      cGroup.add(makeBox(8.8, 0.08, 14.5, new THREE.MeshStandardMaterial({ color: '#15803D', roughness: 0.72 }), 0, 0.04, 0, false, true));
      cGroup.add(makeBox(7.4, 0.1, 12.8, new THREE.MeshStandardMaterial({ color: '#1D4ED8', roughness: 0.68 }), 0, 0.05, 0, false, true));

      cGroup.add(makeBox(7.4, 0.11, 0.1, mats.whiteLine, 0, 0.055, 0, false, false));
      cGroup.add(makeBox(7.4, 0.11, 0.1, mats.whiteLine, 0, 0.055, 6.35, false, false));
      cGroup.add(makeBox(7.4, 0.11, 0.1, mats.whiteLine, 0, 0.055, -6.35, false, false));
      cGroup.add(makeBox(0.1, 0.11, 12.8, mats.whiteLine, 3.65, 0.055, 0, false, false));
      cGroup.add(makeBox(0.1, 0.11, 12.8, mats.whiteLine, -3.65, 0.055, 0, false, false));

      const centerRing = new THREE.Mesh(new THREE.RingGeometry(0.85, 0.95, 24), mats.whiteLine);
      centerRing.rotation.x = -Math.PI / 2;
      centerRing.position.y = 0.115;
      cGroup.add(centerRing);

      [-1, 1].forEach((dir) => {
        const bz = dir * 6.65;
        cGroup.add(makeBox(0.18, 2.35, 0.18, mats.metalDark, 0, 1.175, bz, true, false));
        cGroup.add(makeBox(0.14, 0.14, 0.75, mats.metalDark, 0, 2.25, bz - dir * 0.35, true, false));
        const board = new THREE.Mesh(
          new THREE.BoxGeometry(1.35, 0.82, 0.06),
          new THREE.MeshPhysicalMaterial({ color: '#E0F2FE', transparent: true, opacity: 0.72, roughness: 0.1 })
        );
        board.position.set(0, 2.2, bz - dir * 0.72);
        cGroup.add(board);
        cGroup.add(makeBox(1.38, 0.05, 0.08, mats.whiteLine, 0, 2.6, bz - dir * 0.72, false, false));
        cGroup.add(makeBox(1.38, 0.05, 0.08, mats.whiteLine, 0, 1.8, bz - dir * 0.72, false, false));
        const rim = new THREE.Mesh(
          new THREE.TorusGeometry(0.22, 0.03, 8, 16),
          new THREE.MeshStandardMaterial({ color: '#EA580C', roughness: 0.4 })
        );
        rim.rotation.x = Math.PI / 2;
        rim.position.set(0, 1.98, bz - dir * 0.96);
        cGroup.add(rim);
      });

      return cGroup;
    };

    sportsGroup.add(buildBasketballCourt(-5.0, -13.5));
    sportsGroup.add(buildBasketballCourt(5.0, -13.5));

    // Striped Natural Turf Football Ground framed by 4-Lane Terracotta Athletics Track
    const fieldGroup = new THREE.Group();
    fieldGroup.position.set(0, 0, 8.5);

    const trackOuterW = 20.6;
    const trackOuterD = 26.8;
    const trackLaneW = 2.2;

    fieldGroup.add(makeBox(trackOuterW, 0.07, trackOuterD, mats.terracotta, 0, 0.035, 0, false, true));

    for (let lane = 0; lane <= 4; lane++) {
      const inset = (lane * trackLaneW) / 4;
      const lw = trackOuterW - inset * 2;
      const ld = trackOuterD - inset * 2;
      fieldGroup.add(makeBox(lw, 0.08, 0.06, mats.whiteLine, 0, 0.042, ld / 2, false, false));
      fieldGroup.add(makeBox(lw, 0.08, 0.06, mats.whiteLine, 0, 0.042, -ld / 2, false, false));
      fieldGroup.add(makeBox(0.06, 0.08, ld, mats.whiteLine, lw / 2, 0.042, 0, false, false));
      fieldGroup.add(makeBox(0.06, 0.08, ld, mats.whiteLine, -lw / 2, 0.042, 0, false, false));
    }

    const turfTex = createCanvasTexture(
      (ctx, w, h) => {
        const stripes = 10;
        const sh = h / stripes;
        for (let i = 0; i < stripes; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#4D8B31' : '#5EA33B';
          ctx.fillRect(0, i * sh, w, sh);
        }
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.strokeRect(14, 14, w - 28, h - 28);
        ctx.beginPath();
        ctx.moveTo(14, h / 2);
        ctx.lineTo(w - 14, h / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 46, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeRect(w / 2 - 75, 14, 150, 56);
        ctx.strokeRect(w / 2 - 75, h - 70, 150, 56);
      },
      512,
      512
    );
    const pitchW = trackOuterW - trackLaneW * 2 - 0.5;
    const pitchD = trackOuterD - trackLaneW * 2 - 0.5;
    const pitch = new THREE.Mesh(
      new THREE.BoxGeometry(pitchW, 0.09, pitchD),
      new THREE.MeshStandardMaterial({ map: turfTex, roughness: 0.85 })
    );
    pitch.position.y = 0.045;
    pitch.receiveShadow = true;
    fieldGroup.add(pitch);

    [-1, 1].forEach((dir) => {
      const gz = dir * (pitchD / 2 - 0.7);
      const gw = 3.2;
      const gh = 1.25;
      fieldGroup.add(makeBox(0.1, gh, 0.1, mats.whiteLine, -gw / 2, gh / 2 + 0.08, gz, true, false));
      fieldGroup.add(makeBox(0.1, gh, 0.1, mats.whiteLine, gw / 2, gh / 2 + 0.08, gz, true, false));
      fieldGroup.add(makeBox(gw + 0.1, 0.1, 0.1, mats.whiteLine, 0, gh + 0.08, gz, true, false));
      const net = new THREE.Mesh(
        new THREE.BoxGeometry(gw, gh, 0.9),
        new THREE.MeshStandardMaterial({ color: '#F8FAFC', transparent: true, opacity: 0.35 })
      );
      net.position.set(0, gh / 2 + 0.08, gz + dir * 0.45);
      fieldGroup.add(net);
    });

    const bleachers = new THREE.Group();
    bleachers.position.set(-trackOuterW / 2 - 1.5, 0, 0);
    for (let step = 0; step < 4; step++) {
      bleachers.add(
        makeBox(0.65, 0.35 + step * 0.32, 14.0, mats.granite, -step * 0.58, (0.35 + step * 0.32) / 2, 0, true, true)
      );
      bleachers.add(
        makeBox(0.45, 0.08, 13.8, mats.terracotta, -step * 0.58, 0.39 + step * 0.32, 0, false, false)
      );
    }
    fieldGroup.add(bleachers);

    [
      [-10.4, -21.2],
      [10.4, -21.2],
      [-10.6, 22.2],
      [10.6, 22.2]
    ].forEach(([mx, mz]) => {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 8.6, 10), mats.metalSilver);
      mast.position.set(mx, 4.3, mz);
      mast.castShadow = true;
      sportsGroup.add(mast);
      const bank = makeBox(1.4, 0.55, 0.25, mats.metalDark, mx, 8.65, mz, true, false);
      bank.lookAt(0, 1, 0);
      sportsGroup.add(bank);
    });

    sportsGroup.add(fieldGroup);
    registerBuilding('sports', sportsGroup);
    scene.add(sportsGroup);

    // =========================================================================
    // 8. MAIN ENTRANCE
    // =========================================================================
    const entranceGroup = new THREE.Group();

    const roadCenterX = 13;
    const roadStartZ = 21.5;
    const roadEndZ = 47.6;
    const roadLen = roadEndZ - roadStartZ;
    const roadMidZ = (roadStartZ + roadEndZ) / 2;

    entranceGroup.add(makeBox(4.3, 0.14, roadLen, mats.asphalt, roadCenterX - 3.1, 0.07, roadMidZ, false, true));
    entranceGroup.add(makeBox(4.3, 0.14, roadLen, mats.asphalt, roadCenterX + 3.1, 0.07, roadMidZ, false, true));

    const apron = new THREE.Mesh(new THREE.CylinderGeometry(6.8, 6.8, 0.15, 32), mats.asphalt);
    apron.position.set(roadCenterX, 0.075, 22.5);
    apron.receiveShadow = true;
    entranceGroup.add(apron);

    for (let dz = roadStartZ + 1.5; dz < roadEndZ - 1; dz += 2.6) {
      entranceGroup.add(makeBox(0.12, 0.15, 1.1, mats.whiteLine, roadCenterX - 3.1, 0.075, dz, false, false));
      entranceGroup.add(makeBox(0.12, 0.15, 1.1, mats.whiteLine, roadCenterX + 3.1, 0.075, dz, false, false));
    }

    // WHITE PITCHED-ROOF ENTRANCE CANOPY PAVILION
    const gateZ = 33.6;
    const canopyGroup = new THREE.Group();
    canopyGroup.position.set(roadCenterX, 0.14, gateZ);

    const canopySpanW = 10.8;
    const canopyDepthD = 7.4;
    const eaveH = 4.55;
    const ridgeH = 2.05;

    [-canopySpanW / 2 + 0.45, 0, canopySpanW / 2 - 0.45].forEach((px) => {
      [-canopyDepthD / 2 + 0.55, canopyDepthD / 2 - 0.55].forEach((pz) => {
        canopyGroup.add(makeBox(0.62, 0.5, 0.62, mats.granite, px, 0.25, pz, true, true));
        canopyGroup.add(makeBox(0.46, eaveH - 0.5, 0.46, mats.whiteColumn, px, 0.5 + (eaveH - 0.5) / 2, pz, true, true));
      });
    });

    // Central White Security & Reception Kiosk inside the Canopy Median
    canopyGroup.add(makeBox(1.55, 2.55, 5.2, mats.whiteColumn, 0, 1.275, 0, true, true));
    canopyGroup.add(makeBox(1.62, 1.05, 4.2, mats.glassClassical, 0, 1.72, 0, false, false));
    const kioskSignTex = createCanvasTexture(
      (ctx, w, h) => {
        ctx.fillStyle = '#0F766E';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.strokeRect(6, 6, w - 12, h - 12);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('KRMU ENTRANCE', w / 2, h / 2);
      },
      256,
      96
    );
    const kioskSign = new THREE.Mesh(
      new THREE.BoxGeometry(1.38, 0.52, 0.1),
      new THREE.MeshStandardMaterial({ map: kioskSignTex, roughness: 0.4 })
    );
    kioskSign.position.set(0, 0.85, 2.64);
    canopyGroup.add(kioskSign);

    // Overhead White Fascia Box Beam & K.R. MANGALAM UNIVERSITY Signboard
    canopyGroup.add(makeBox(canopySpanW + 0.6, 0.62, canopyDepthD + 0.6, mats.whiteColumn, 0, eaveH + 0.1, 0, true, true));

    const gateSignTex = createCanvasTexture(
      (ctx, w, h) => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#B84A39';
        ctx.lineWidth = 8;
        ctx.strokeRect(8, 8, w - 16, h - 16);
        ctx.fillStyle = '#B84A39';
        ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('K.R. MANGALAM UNIVERSITY', w / 2, h / 2);
      },
      1024,
      128
    );
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(8.8, 0.54, 0.1),
      new THREE.MeshStandardMaterial({ map: gateSignTex, roughness: 0.35 })
    );
    signBoard.position.set(0, eaveH + 0.1, canopyDepthD / 2 + 0.33);
    canopyGroup.add(signBoard);
    const rearSignBoard = signBoard.clone();
    rearSignBoard.position.set(0, eaveH + 0.1, -canopyDepthD / 2 - 0.33);
    rearSignBoard.rotation.y = Math.PI;
    canopyGroup.add(rearSignBoard);

    // White Pitched Gable Roof over the Entrance Canopy
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-(canopySpanW / 2 + 0.55), 0);
    gableShape.lineTo(canopySpanW / 2 + 0.55, 0);
    gableShape.lineTo(0, ridgeH);
    gableShape.closePath();
    const gableGeo = new THREE.ExtrudeGeometry(gableShape, {
      depth: canopyDepthD + 0.9,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 2
    });
    const gableRoof = new THREE.Mesh(gableGeo, mats.whiteColumn);
    gableRoof.position.set(0, eaveH + 0.38, -(canopyDepthD + 0.9) / 2);
    gableRoof.castShadow = true;
    gableRoof.receiveShadow = true;
    canopyGroup.add(gableRoof);

    // Standing-seam roof ridge ribs on the white pitched canopy roof
    for (let rz = -canopyDepthD / 2; rz <= canopyDepthD / 2; rz += 1.2) {
      const leftSlope = makeBox(6.2, 0.08, 0.1, mats.plinthTrim, -2.9, eaveH + 0.38 + ridgeH / 2, rz, false, false);
      leftSlope.rotation.z = Math.atan2(ridgeH, canopySpanW / 2 + 0.55);
      canopyGroup.add(leftSlope);

      const rightSlope = makeBox(6.2, 0.08, 0.1, mats.plinthTrim, 2.9, eaveH + 0.38 + ridgeH / 2, rz, false, false);
      rightSlope.rotation.z = -Math.atan2(ridgeH, canopySpanW / 2 + 0.55);
      canopyGroup.add(rightSlope);
    }

    // Flanking Terracotta Brick Portal Wing Piers
    [-6.6, 6.6].forEach((wx) => {
      canopyGroup.add(makeBox(1.4, 4.9, 1.5, mats.terracotta, wx, 2.45, 0, true, true));
      canopyGroup.add(makeBox(1.65, 0.3, 1.75, mats.sandstoneTrim, wx, 5.0, 0, true, true));
      canopyGroup.add(makeBox(0.24, 3.6, 1.58, mats.sandstoneTrim, wx, 2.45, 0, false, false));
    });

    // Boom Barriers across both lanes
    [-2.8, 2.8].forEach((bx) => {
      canopyGroup.add(makeBox(0.26, 0.95, 0.26, mats.terracotta, bx, 0.475, 2.6, true, true));
      canopyGroup.add(makeBox(2.2, 0.08, 0.08, mats.whiteLine, bx * 0.55, 0.88, 2.6, false, false));
    });

    entranceGroup.add(canopyGroup);

    // Central Median Planter with Topiary Shrubs & Tall Flagpole (Tiranga) in front of Canopy
    const medianLen = 9.2;
    const medianZ = 42.4;
    entranceGroup.add(makeBox(1.5, 0.34, medianLen, mats.sandstoneTrim, roadCenterX, 0.17, medianZ, true, true));
    entranceGroup.add(makeBox(1.1, 0.38, medianLen - 0.4, mats.lawnDark, roadCenterX, 0.19, medianZ, false, true));

    [-3.4, -1.8, 1.8, 3.4].forEach((tz) => {
      const shrub = new THREE.Mesh(new THREE.SphereGeometry(0.54, 12, 10), mats.treeFoliage1);
      shrub.position.set(roadCenterX, 0.62, medianZ + tz);
      shrub.castShadow = true;
      entranceGroup.add(shrub);
    });

    const poleBase = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 0.7, 16), mats.granite);
    poleBase.position.set(roadCenterX, 0.55, medianZ);
    entranceGroup.add(poleBase);

    const flagpole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 11.8, 12), mats.metalSilver);
    flagpole.position.set(roadCenterX, 6.2, medianZ);
    flagpole.castShadow = true;
    entranceGroup.add(flagpole);

    const finial = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      new THREE.MeshStandardMaterial({ color: '#F59E0B', metalness: 0.8, roughness: 0.2 })
    );
    finial.position.set(roadCenterX, 12.15, medianZ);
    entranceGroup.add(finial);

    // Tiranga Canvas Texture
    const tirangaTex = createCanvasTexture(
      (ctx, w, h) => {
        ctx.fillStyle = '#FF9933';
        ctx.fillRect(0, 0, w, h / 3);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, h / 3, w, h / 3);
        ctx.fillStyle = '#138808';
        ctx.fillRect(0, (2 * h) / 3, w, h / 3);

        const cx = w / 2;
        const cy = h / 2;
        const r = h * 0.145;
        ctx.strokeStyle = '#000080';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 2;
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          ctx.stroke();
        }
      },
      384,
      256
    );

    const flagW = 3.3;
    const flagH = 2.2;
    const flagGeo = new THREE.PlaneGeometry(flagW, flagH, 24, 12);
    flagGeo.translate(flagW / 2, 0, 0);
    const flagMat = new THREE.MeshStandardMaterial({
      map: tirangaTex,
      side: THREE.DoubleSide,
      roughness: 0.55
    });
    const flagMesh = new THREE.Mesh(flagGeo, flagMat);
    flagMesh.position.set(roadCenterX + 0.08, 10.8, medianZ);
    flagMesh.castShadow = true;
    entranceGroup.add(flagMesh);

    animatedRefs.current.flagMesh = flagMesh;
    animatedRefs.current.flagBasePositions = new Float32Array(flagGeo.attributes.position.array);

    // Dual Interlocking Paver Parking Plazas
    entranceGroup.add(makeBox(21.5, 0.16, 17.5, mats.paver, -4.4, 0.08, 34.5, false, true));
    entranceGroup.add(makeBox(26.5, 0.16, 17.5, mats.paver, 34.8, 0.08, 34.5, false, true));

    for (let sx = -13.5; sx <= 4.5; sx += 2.2) {
      entranceGroup.add(makeBox(0.08, 0.17, 3.8, mats.whiteLine, sx, 0.085, 29.0, false, false));
      entranceGroup.add(makeBox(0.08, 0.17, 3.8, mats.whiteLine, sx, 0.085, 40.0, false, false));
    }
    for (let sx = 23.0; sx <= 39.0; sx += 2.2) {
      entranceGroup.add(makeBox(0.08, 0.17, 3.8, mats.whiteLine, sx, 0.085, 29.0, false, false));
      entranceGroup.add(makeBox(0.08, 0.17, 3.8, mats.whiteLine, sx, 0.085, 40.0, false, false));
    }

    // Covered Bicycle Rack Shelter (East Parking Plaza)
    const bikeShelter = new THREE.Group();
    bikeShelter.position.set(44.4, 0.16, 38.5);
    const shelterRoof = makeBox(4.4, 0.14, 7.6, mats.terracotta, 0, 2.15, 0, true, true);
    shelterRoof.rotation.z = -0.08;
    bikeShelter.add(shelterRoof);
    [-1.8, 1.8].forEach((px) => {
      [-3.2, 0, 3.2].forEach((pz) => {
        bikeShelter.add(makeBox(0.14, 2.15, 0.14, mats.metalDark, px, 1.075, pz, true, false));
      });
    });
    for (let bz = -2.8; bz <= 2.8; bz += 0.92) {
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 6, 12, Math.PI), mats.metalSilver);
      hoop.position.set(-0.6, 0.28, bz);
      bikeShelter.add(hoop);

      const cycle = new THREE.Group();
      cycle.position.set(0.1, 0, bz);
      const w1 = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 8, 16), mats.metalDark);
      w1.position.set(-0.48, 0.3, 0);
      const w2 = w1.clone();
      w2.position.set(0.48, 0.3, 0);
      cycle.add(w1, w2);
      const frame = makeBox(0.75, 0.05, 0.05, new THREE.MeshStandardMaterial({ color: '#0F766E' }), 0, 0.52, 0, false, false);
      frame.rotation.z = 0.2;
      cycle.add(frame);
      cycle.add(makeBox(0.05, 0.42, 0.05, mats.metalSilver, -0.35, 0.56, 0, false, false));
      cycle.add(makeBox(0.05, 0.05, 0.38, mats.metalDark, -0.35, 0.77, 0, false, false));
      bikeShelter.add(cycle);
    }
    entranceGroup.add(bikeShelter);

    registerBuilding('entrance', entranceGroup);
    scene.add(entranceGroup);

    // =========================================================================
    // 9. DETAILED VEHICLES (Cars, Motorcycles, Scooties & Yellow KRMU Buses)
    // =========================================================================
    const carBodyColors = ['#F8FAFC', '#1E293B', '#64748B', '#991B1B', '#1E3A8A', '#D6D3D1', '#0F766E'];

    const createDetailedCar = (colorHex: string, isSuv = false) => {
      const car = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.28, metalness: 0.35 });
      const chH = isSuv ? 0.56 : 0.46;
      const cabH = isSuv ? 0.48 : 0.42;
      const cabD = isSuv ? 2.15 : 1.75;

      car.add(makeBox(1.52, chH, 3.35, bodyMat, 0, 0.24 + chH / 2, 0, true, true));
      car.add(makeBox(1.32, cabH, cabD, bodyMat, 0, 0.24 + chH + cabH / 2 - 0.04, isSuv ? -0.18 : -0.12, true, true));

      const frontGlass = makeBox(1.24, cabH * 0.82, 0.08, mats.glassTintMat, 0, 0.24 + chH + cabH * 0.42, isSuv ? 0.88 : 0.74, false, false);
      frontGlass.rotation.x = -0.35;
      car.add(frontGlass);
      const rearGlass = makeBox(1.22, cabH * 0.78, 0.08, mats.glassTintMat, 0, 0.24 + chH + cabH * 0.42, isSuv ? -1.24 : -0.98, false, false);
      rearGlass.rotation.x = 0.32;
      car.add(rearGlass);
      car.add(makeBox(1.35, cabH * 0.72, cabD * 0.78, mats.glassTintMat, 0, 0.24 + chH + cabH * 0.44, isSuv ? -0.18 : -0.12, false, false));

      [-0.52, 0.52].forEach((lx) => {
        car.add(makeBox(0.32, 0.14, 0.06, mats.headlightMat, lx, 0.52, 1.68, false, false));
        car.add(makeBox(0.34, 0.14, 0.06, mats.taillightMat, lx, 0.54, -1.68, false, false));
      });

      [
        [-0.76, 0.26, 1.05],
        [0.76, 0.26, 1.05],
        [-0.76, 0.26, -1.05],
        [0.76, 0.26, -1.05]
      ].forEach(([wx, wy, wz]) => {
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.2, 16), mats.tireMat);
        tire.rotation.z = Math.PI / 2;
        tire.position.set(wx, wy, wz);
        tire.castShadow = true;
        car.add(tire);

        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.21, 12), mats.rimMat);
        rim.rotation.z = Math.PI / 2;
        rim.position.set(wx, wy, wz);
        car.add(rim);
      });

      return car;
    };

    const createTwoWheeler = (colorHex: string, isScooty = false) => {
      const bike = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.35, metalness: 0.4 });
      [-0.44, 0.44].forEach((wz) => {
        const w = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.055, 8, 16), mats.tireMat);
        w.rotation.y = Math.PI / 2;
        w.position.set(0, 0.25, wz);
        bike.add(w);
      });
      if (isScooty) {
        bike.add(makeBox(0.34, 0.34, 0.72, bodyMat, 0, 0.46, -0.14, true, false));
        bike.add(makeBox(0.32, 0.52, 0.22, bodyMat, 0, 0.56, 0.34, true, false));
      } else {
        bike.add(makeBox(0.26, 0.24, 0.85, bodyMat, 0, 0.56, -0.05, true, false));
        bike.add(makeBox(0.22, 0.26, 0.42, mats.metalDark, 0, 0.42, 0.02, true, false));
      }
      bike.add(makeBox(0.56, 0.05, 0.05, mats.metalSilver, 0, 0.86, 0.32, false, false));
      bike.add(makeBox(0.12, 0.12, 0.06, mats.headlightMat, 0, 0.74, 0.44, false, false));
      return bike;
    };

    // Yellow K.R. Mangalam University Bus Builder
    const createKrmuBus = () => {
      const bus = new THREE.Group();
      const bw = 1.65;
      const bh = 1.95;
      const bl = 5.4;

      bus.add(makeBox(bw, bh, bl, mats.busYellow, 0, 0.38 + bh / 2, 0, true, true));
      bus.add(makeBox(bw - 0.1, 0.12, bl - 0.2, mats.whiteColumn, 0, 0.38 + bh + 0.06, 0, false, false));
      bus.add(makeBox(0.95, 0.18, 1.3, mats.metalSilver, 0, 0.38 + bh + 0.18, 0.4, false, false));
      bus.add(makeBox(bw + 0.04, 0.68, bl - 0.5, mats.glassTintMat, 0, 0.38 + bh * 0.64, -0.1, false, false));
      bus.add(makeBox(bw + 0.05, 0.22, bl - 0.2, mats.busStripe, 0, 0.38 + bh * 0.36, 0, false, false));
      bus.add(makeBox(bw - 0.16, 0.85, 0.08, mats.glassTintMat, 0, 0.38 + bh * 0.62, bl / 2 + 0.01, false, false));

      [
        [-0.82, 0.36, 1.75],
        [0.82, 0.36, 1.75],
        [-0.82, 0.36, -1.65],
        [0.82, 0.36, -1.65]
      ].forEach(([wx, wy, wz]) => {
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.24, 16), mats.tireMat);
        tire.rotation.z = Math.PI / 2;
        tire.position.set(wx, wy, wz);
        tire.castShadow = true;
        bus.add(tire);
      });
      return bus;
    };

    [-21.2, -14.8, -8.4].forEach((bz) => {
      const eastBus = createKrmuBus();
      eastBus.position.set(27.5, 0.15, bz);
      vehiclesGroup.add(eastBus);
    });
    [3.5, 9.8, 16.1, 22.4].forEach((bx) => {
      const northBus = createKrmuBus();
      northBus.position.set(bx, 0.15, -24.5);
      northBus.rotation.y = Math.PI / 2;
      vehiclesGroup.add(northBus);
    });

    [
      [-12.4, 29.0, 0, 0, false],
      [-8.0, 29.0, 0, 1, true],
      [-3.6, 29.0, 0, 2, false],
      [0.8, 29.0, 0, 3, true],
      [-10.2, 40.0, Math.PI, 4, false],
      [-5.8, 40.0, Math.PI, 5, true],
      [-1.4, 40.0, Math.PI, 6, false],
      [3.0, 40.0, Math.PI, 0, false]
    ].forEach(([x, z, rot, cIdx, suv]) => {
      const car = createDetailedCar(carBodyColors[cIdx as number], suv as boolean);
      car.position.set(x as number, 0.16, z as number);
      car.rotation.y = rot as number;
      vehiclesGroup.add(car);
    });

    [
      [24.3, 29.0, 0, 1, true],
      [28.7, 29.0, 0, 0, false],
      [33.1, 29.0, 0, 6, true],
      [37.5, 29.0, 0, 3, false],
      [26.5, 40.0, Math.PI, 2, false],
      [30.9, 40.0, Math.PI, 4, true],
      [35.3, 40.0, Math.PI, 5, false]
    ].forEach(([x, z, rot, cIdx, suv]) => {
      const car = createDetailedCar(carBodyColors[cIdx as number], suv as boolean);
      car.position.set(x as number, 0.16, z as number);
      car.rotation.y = rot as number;
      vehiclesGroup.add(car);
    });

    const twoWheelerColors = ['#0F766E', '#DC2626', '#1E293B', '#F8FAFC', '#2563EB', '#D97706'];
    for (let i = 0; i < 10; i++) {
      const tw = createTwoWheeler(twoWheelerColors[i % twoWheelerColors.length], i % 2 === 1);
      tw.position.set(41.4 + (i % 5) * 1.15, 0.16, i < 5 ? 28.4 : 31.2);
      tw.rotation.y = i < 5 ? 0 : Math.PI;
      vehiclesGroup.add(tw);
    }

    scene.add(vehiclesGroup);

    // =========================================================================
    // 10. LANDSCAPE TREES & AVENUE PLANTING INSIDE PLINTH
    // =========================================================================
    const landscapeGroup = new THREE.Group();
    const addTree = (x: number, z: number, scale = 1, variant = 0) => {
      const t = new THREE.Group();
      t.position.set(x, 0.12, z);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * scale, 0.22 * scale, 1.6 * scale, 8), mats.treeTrunk);
      trunk.position.y = 0.8 * scale;
      trunk.castShadow = true;
      t.add(trunk);

      const canopyMat = variant === 0 ? mats.treeFoliage1 : mats.treeFoliage2;
      const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.25 * scale, 1), canopyMat);
      c1.position.y = 2.15 * scale;
      c1.castShadow = true;
      t.add(c1);

      const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85 * scale, 1), canopyMat);
      c2.position.set(0.45 * scale, 2.55 * scale, 0.3 * scale);
      c2.castShadow = true;
      t.add(c2);

      landscapeGroup.add(t);
    };

    for (let tz = 24; tz <= 43; tz += 4.6) {
      if (Math.abs(tz - gateZ) < 3.4) continue;
      addTree(7.1, tz, 0.9, 0);
      addTree(18.9, tz, 0.9, 1);
    }

    [
      [-54, 38, 1.1, 0],
      [-48, 41, 1.0, 1],
      [-38, 40, 1.15, 0],
      [-28, 41, 0.95, 1],
      [-19, 39, 1.05, 0],
      [51, 39, 1.1, 1],
      [52, 26, 1.05, 0],
      [48, 14, 1.15, 1],
      [49, -6, 1.0, 0],
      [49, -24, 1.1, 1],
      [44, -39, 1.05, 0],
      [29, -42, 1.05, 1],
      [-5, -42, 1.05, 0],
      [-21, -38, 1.15, 1],
      [-31, -28, 0.95, 0],
      [-54, -38, 1.1, 1],
      [-55, -14, 1.0, 0],
      [-55, 12, 1.05, 1],
      [4.5, -1.5, 0.85, 0],
      [21.5, -1.5, 0.85, 1]
    ].forEach(([x, z, s, v]) => addTree(x, z, s, v));

    scene.add(landscapeGroup);
    scene.add(roofDetailsGroup);

    // =========================================================================
    // 11. RAYCASTING FOR CLICK & HOVER INTERACTIVITY
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const getHitBuildingId = (clientX: number, clientY: number): string | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableMeshesRef.current, false);
      if (hits.length > 0) {
        return (hits[0].object.userData.buildingId as string) || null;
      }
      return null;
    };

    const onPointerMove = (e: MouseEvent) => {
      const hitId = getHitBuildingId(e.clientX, e.clientY);
      setHoveredId(hitId);
      renderer.domElement.style.cursor = hitId ? 'pointer' : 'grab';
    };

    const onPointerDown = (e: MouseEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: MouseEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist < 5) {
        const hitId = getHitBuildingId(e.clientX, e.clientY);
        if (hitId) {
          handleSelectBuilding(hitId);
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // =========================================================================
    // 12. RESIZE & ANIMATION LOOP
    // =========================================================================
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const resizeObserver = new ResizeObserver(() => onResize());
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    const tempVec = new THREE.Vector3();
    let animFrameId: number;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      const { flagMesh, flagBasePositions, camAnim } = animatedRefs.current;
      if (flagMesh && flagBasePositions) {
        const posAttr = flagMesh.geometry.attributes.position;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < arr.length; i += 3) {
          const x = flagBasePositions[i];
          const y = flagBasePositions[i + 1];
          const pinFactor = Math.min(1, x / 3.3);
          arr[i + 2] =
            Math.sin(x * 2.2 - elapsed * 4.4) * 0.16 * pinFactor +
            Math.cos(y * 1.8 - elapsed * 3.1) * 0.04 * pinFactor;
        }
        posAttr.needsUpdate = true;
      }

      if (camAnim) {
        camAnim.progress = Math.min(1, camAnim.progress + 0.045);
        const ease = 1 - Math.pow(1 - camAnim.progress, 3);
        camera.position.lerp(camAnim.targetPos, ease * 0.16 + 0.03);
        controls.target.lerp(camAnim.targetLook, ease * 0.16 + 0.03);
        if (
          camera.position.distanceTo(camAnim.targetPos) < 0.15 &&
          controls.target.distanceTo(camAnim.targetLook) < 0.15
        ) {
          animatedRefs.current.camAnim = null;
        }
      }

      controls.update();

      const cw = container.clientWidth || window.innerWidth;
      const ch = container.clientHeight || window.innerHeight;
      CAMPUS_DATA.forEach((b) => {
        const el = labelRefs.current[b.id];
        if (!el) return;
        tempVec.set(b.anchor[0], b.anchor[1], b.anchor[2]);
        tempVec.project(camera);
        const isBehind = tempVec.z > 1;
        const sx = (tempVec.x * 0.5 + 0.5) * cw;
        const sy = (-tempVec.y * 0.5 + 0.5) * ch;
        if (isBehind || sx < -80 || sx > cw + 80 || sy < -40 || sy > ch + 40) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        } else {
          el.style.opacity = '1';
          el.style.pointerEvents = 'auto';
          el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -100%)`;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', onResize);
      controls.removeEventListener('start', onControlStart);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [handleSelectBuilding]);

  return (
    <div className={`relative w-full h-full min-h-[640px] overflow-hidden bg-[#F1F5F9] text-[#0F172A] font-sans select-none ${className}`}>
      {/* 3D WebGL Viewport */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Projected 3D Callout Labels */}
      {showLabels && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {CAMPUS_DATA.map((b) => {
            const isSelected = selectedId === b.id;
            const isHovered = hoveredId === b.id;
            return (
              <button
                key={b.id}
                ref={(el) => {
                  labelRefs.current[b.id] = el;
                }}
                onClick={() => handleSelectBuilding(b.id)}
                style={{ left: 0, top: 0 }}
                className={`absolute flex flex-col items-center transition-colors duration-150 group focus:outline-none cursor-pointer ${
                  isSelected ? 'z-30' : isHovered ? 'z-20' : 'z-10'
                }`}
              >
                <div
                  className={`px-2.5 py-1 rounded-md border text-xs font-semibold tracking-tight shadow-sm whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-md scale-105'
                      : isHovered
                      ? 'bg-white text-[#0F766E] border-[#0F766E] shadow-md'
                      : 'bg-white/95 text-[#0F172A] border-[#CBD5E1] hover:border-[#0F766E]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-[#0F766E]'
                    }`}
                  />
                  <span>{b.name}</span>
                </div>
                <div
                  className={`w-px h-3 ${
                    isSelected ? 'bg-[#0F766E]' : 'bg-[#64748B]/70'
                  }`}
                />
                <div
                  className={`w-1.5 h-1.5 rounded-full border border-white ${
                    isSelected ? 'bg-[#0F766E]' : 'bg-[#334155]'
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Top-Left Enterprise Header Card */}
      <header className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-sm border border-[#CBD5E1] rounded-lg shadow-sm px-4 py-3 max-w-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs tracking-wider shrink-0">
            KRMU
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-[#0F172A] tracking-tight leading-tight">
                K.R. Mangalam University
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F8FAFC] text-[#0F766E] border border-[#CBD5E1]">
                1:250 Scale
              </span>
            </div>
            <p className="text-xs text-[#475569] mt-0.5">
              Sohna Road, Gurugram • Architectural Campus Model
            </p>
          </div>
        </div>
      </header>

      {/* Top-Right Scene Controls Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-sm border border-[#CBD5E1] rounded-lg shadow-sm p-1.5">
        <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-0.5">
          <button
            type="button"
            onClick={() => setLightingMode('day')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              lightingMode === 'day'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Studio Day
          </button>
          <button
            type="button"
            onClick={() => setLightingMode('golden')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              lightingMode === 'golden'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            Golden Hour
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowLabels((v) => !v)}
          className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
            showLabels
              ? 'bg-[#F0FDFA] text-[#0F766E] border-[#0F766E]/40'
              : 'bg-white text-[#475569] border-[#E2E8F0] hover:text-[#0F172A]'
          }`}
        >
          Labels: {showLabels ? 'On' : 'Off'}
        </button>

        <button
          type="button"
          onClick={() => setShowVehiclesAndRoof((v) => !v)}
          className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
            showVehiclesAndRoof
              ? 'bg-[#F0FDFA] text-[#0F766E] border-[#0F766E]/40'
              : 'bg-white text-[#475569] border-[#E2E8F0] hover:text-[#0F172A]'
          }`}
        >
          Vehicles & Roof: {showVehiclesAndRoof ? 'On' : 'Off'}
        </button>
      </div>

      {/* Bottom Camera Angle Presets Dock */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-[#CBD5E1] rounded-lg shadow-sm p-1.5 max-w-[95vw] overflow-x-auto">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] px-2 hidden sm:inline">
          Views
        </span>
        {CAMERA_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => {
              setSelectedId(null);
              flyTo(preset.pos, preset.target, preset.id);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activePreset === preset.id
                ? 'bg-[#0F766E] text-white'
                : 'bg-[#F8FAFC] text-[#334155] hover:bg-[#E2E8F0]/70 border border-[#E2E8F0]'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Bottom-Left Quick Block Directory */}
      <div className="hidden lg:flex flex-col gap-1.5 absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm border border-[#CBD5E1] rounded-lg shadow-sm p-3 w-56">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
            Campus Zones
          </span>
          <span className="text-[10px] font-medium text-[#0F766E]">N ↑ • 120×96</span>
        </div>
        <div className="flex flex-col gap-1 mt-0.5">
          {CAMPUS_DATA.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => handleSelectBuilding(b.id)}
              className={`flex items-center justify-between px-2 py-1 rounded text-left text-xs transition-colors cursor-pointer ${
                selectedId === b.id
                  ? 'bg-[#0F766E] text-white font-semibold'
                  : 'text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F766E]'
              }`}
            >
              <span className="truncate">{b.name}</span>
              <span
                className={`text-[10px] font-mono ml-1.5 ${
                  selectedId === b.id ? 'text-white/90' : 'text-[#64748B]'
                }`}
              >
                {b.code}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Slide-Over Building Inspector Drawer */}
      <aside
        className={`absolute top-16 right-4 bottom-16 w-88 max-w-[calc(100vw-2rem)] z-30 bg-white border border-[#CBD5E1] rounded-lg shadow-lg flex flex-col transition-transform duration-200 ease-out font-sans ${
          selectedBuilding ? 'translate-x-0' : 'translate-x-[120%] pointer-events-none'
        }`}
      >
        {selectedBuilding && (
          <>
            <div className="px-4 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC] rounded-t-lg flex items-start justify-between gap-2">
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20">
                  {selectedBuilding.code}
                </span>
                <h2 className="text-base font-bold text-[#0F172A] mt-1 leading-snug">
                  {selectedBuilding.name}
                </h2>
                <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                  {selectedBuilding.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Close inspector"
                className="p-1.5 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]/60 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                    Elevation
                  </div>
                  <div className="text-xs font-bold text-[#0F172A] mt-0.5">
                    {selectedBuilding.floors}
                  </div>
                </div>
                <div className="p-2.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                    Built-Up Footprint
                  </div>
                  <div className="text-xs font-bold text-[#0F172A] mt-0.5">
                    {selectedBuilding.area}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569] mb-2">
                  Architectural & Functional Specs
                </h3>
                <ul className="space-y-2">
                  {selectedBuilding.highlights.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-[#334155] leading-relaxed bg-[#F8FAFC] p-2 rounded border border-[#E2E8F0]/80"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC] rounded-b-lg flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    flyTo(selectedBuilding.cameraPos, selectedBuilding.cameraTarget)
                  }
                  className="flex-1 py-1.5 px-3 rounded-md bg-[#0F766E] text-white text-xs font-semibold hover:bg-[#115E59] transition-colors cursor-pointer text-center"
                >
                  Re-Center Camera
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(null);
                    flyTo([0, 66, 88], [0, 2, 0], 'overview');
                  }}
                  className="py-1.5 px-3 rounded-md bg-white border border-[#CBD5E1] text-[#334155] text-xs font-medium hover:bg-[#F1F5F9] transition-colors cursor-pointer text-center"
                >
                  Full Plinth
                </button>
              </div>

              {/* Signature Deep Teal Button with 4-Layer Tactile Button Shadows */}
              <button
                type="button"
                onClick={handleReportIssueClick}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0d655e] transition-all duration-200 active:scale-95 cursor-pointer shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Report Issue Here</span>
              </button>
            </div>
          </>
        )}
      </aside>

      {/* AI Facility Ticketing System: SmartResolveModal */}
      {selectedBuilding && (
        <SmartResolveModal
          isOpen={isTicketingOpen}
          onClose={() => setIsTicketingOpen(false)}
          selectedBuilding={selectedBuilding.name}
        />
      )}
    </div>
  );
}

export default KrmuCampusExplorer;
