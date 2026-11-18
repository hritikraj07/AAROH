import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SmartResolveModal } from './SmartResolveModal';
import { AlertTriangle, Compass, Sun, Moon, Eye } from 'lucide-react';

interface CampusBuildingItem {
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

interface CameraPreset {
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
    floors: '5 Stories (G + 4) + 5 Classical Domes',
    area: '1,42,000 sq. ft.',
    anchor: [13, 19, 13],
    cameraPos: [14, 25, 48],
    cameraTarget: [13, 6, 13],
    highlights: [
      'Neoclassical cream sandstone facade (#E8E1D3) with terracotta-red roof (#B84A39) & 4 classical columns',
      'Grand portico entrance with triangular pediment and steps leading to double entrance doors',
      '5 white ribbed rooftop domes (1 large central cupola + 4 corner chhatris) with spires',
      'Central administrative hub housing admissions, rectorate, and the 800-seat university auditorium'
    ]
  },
  {
    id: 'bhaskaracharya',
    code: 'BLOCK B',
    name: 'Bhaskaracharya Block',
    subtitle: 'School of Engineering & Technology (SOET): CSE, AI/ML & Robotics Labs',
    floors: '5 Stories (G + 4) West Wing',
    area: '1,08,000 sq. ft.',
    anchor: [-3.5, 15, -3],
    cameraPos: [-22, 26, 22],
    cameraTarget: [-3.5, 5.5, -3],
    highlights: [
      'Extends northward from Aryabhata Block forming the western wing of the academic quad',
      'Cream sandstone facade with punched classroom window grids',
      'High-Performance AI/ML Computing Labs, IoT & Embedded Hardware Studios',
      'Rooftop photovoltaic solar panel arrays and centralized HVAC chiller systems'
    ]
  },
  {
    id: 'chanakya',
    code: 'BLOCK C',
    name: 'Chanakya Block',
    subtitle: 'School of Management, Commerce, Law & Liberal Arts',
    floors: '5 Stories (G + 4) East Wing',
    area: '1,12,000 sq. ft.',
    anchor: [29.5, 15, -3],
    cameraPos: [54, 26, 22],
    cameraTarget: [29.5, 5.5, -3],
    highlights: [
      'Extends northward forming the eastern wing of the main academic quad',
      'Sandstone architectural facade with regular classroom window bays',
      'Central Library, Bloomberg Financial Market Terminal Lab, and Moot Court',
      'Rooftop solar arrays and direct views of the central green sports grounds'
    ]
  },
  {
    id: 'dblock',
    code: 'BLOCK D',
    name: 'D Block',
    subtitle: 'Contemporary Curtain-Wall Academic, Innovation & Research Tower',
    floors: '7 Stories (G + 6)',
    area: '1,28,000 sq. ft.',
    anchor: [13, 22, -28],
    cameraPos: [13, 26, -6],
    cameraTarget: [13, 9, -28],
    highlights: [
      'High-rise modern tower with dark reflective glass curtain wall facade (#1E293B)',
      'Cantilevered white portal frame enclosing upper floors and roofline',
      'Rooftop steel pergola railing structure and double photovoltaic solar arrays',
      'Hosts Innovation & Incubation Center, Robotics Prototyping Labs, and Research Studios'
    ]
  },
  {
    id: 'hostels',
    code: 'RESIDENCES',
    name: 'Boys & Girls Hostels',
    subtitle: 'Multi-Story Residential Quarters & Dining Commons',
    floors: '6 Stories (G + 5) Residential Tower',
    area: '1,65,000 sq. ft.',
    anchor: [-46, 20, -12],
    cameraPos: [-68, 28, 18],
    cameraTarget: [-46, 7, -12],
    highlights: [
      'Positioned along the western flank of campus with dedicated residential courtyards',
      'Clean off-white facade with recessed balconies, ventilation louvers, and window banks',
      'Rooftop overhead water reservoirs, solar water heating systems, and elevator overruns',
      'Includes student dining commons, recreation rooms, and laundry facilities'
    ]
  },
  {
    id: 'sports',
    code: 'ATHLETICS',
    name: 'Sports Grounds & Central Field',
    subtitle: 'FIBA Basketball Courts, Turf Football Pitch & Athletics Track',
    floors: 'Outdoor Sports Complex',
    area: '1,45,000 sq. ft.',
    anchor: [-24, 6, 12],
    cameraPos: [-24, 32, 46],
    cameraTarget: [-24, 2, 12],
    highlights: [
      'Regulation football/soccer pitch with alternating striped green turf and goal posts',
      'Terracotta 4-lane athletic running track enclosing the central field',
      'Red stepped spectator grandstand bleachers for campus tournaments and sports meets',
      'Dual royal-blue FIBA basketball courts with backboards and high-mast LED floodlights'
    ]
  },
  {
    id: 'entrance',
    code: 'MAIN GATE',
    name: 'Main Entrance',
    subtitle: 'Campus Gatehouse, White Canopy, Indian Tricolor Flag & Parking Plazas',
    floors: 'Campus Forecourt & Avenue',
    area: '88,000 sq. ft.',
    anchor: [13, 8.5, 36],
    cameraPos: [13, 20, 64],
    cameraTarget: [13, 3.5, 29],
    highlights: [
      'White hipped entrance canopy pavilion with red boundary piers and security kiosk',
      'Central median flagpole flying the Indian National Flag (Tiranga) with wave animation',
      'Divided two-way asphalt roadway with painted white lane dashes and traffic control cones',
      'Dedicated west and east parking plazas with marked car stalls and covered two-wheeler shed'
    ]
  }
];

const CAMERA_PRESETS: CameraPreset[] = [
  { id: 'overview', label: 'Establishing Overview', pos: [14, 72, 94], target: [0, 4, 4] },
  { id: 'aryabhata', label: 'Aryabhata & Main Gate', pos: [14, 24, 58], target: [13, 5, 18] },
  { id: 'dblock_view', label: 'D Block View', pos: [13, 25, -10], target: [13, 8, -28] },
  { id: 'west', label: 'Hostels & Sports', pos: [-64, 32, 28], target: [-30, 4, 4] },
  { id: 'plan', label: 'Top-Down Plan', pos: [0, 116, 2], target: [0, 0, 0] }
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
    camAnim: null
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>('overview');
  const [lightingMode, setLightingMode] = useState<'day' | 'golden'>('day');
  const [showLabels, setShowLabels] = useState<boolean>(true);

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

  useEffect(() => {
    const { sunLight, hemiLight, fillLight } = animatedRefs.current;
    if (!sunLight || !hemiLight || !fillLight) return;

    if (lightingMode === 'golden') {
      sunLight.color.set('#FDBA74');
      sunLight.intensity = 2.4;
      sunLight.position.set(58, 36, 44);
      hemiLight.color.set('#FEF3C7');
      hemiLight.groundColor.set('#94A3B8');
      hemiLight.intensity = 0.85;
      fillLight.color.set('#93C5FD');
      fillLight.intensity = 0.45;
    } else {
      sunLight.color.set('#FFFBEB');
      sunLight.intensity = 2.1;
      sunLight.position.set(46, 72, 50);
      hemiLight.color.set('#FFFFFF');
      hemiLight.groundColor.set('#CBD5E1');
      hemiLight.intensity = 1.05;
      fillLight.color.set('#E2E8F0');
      fillLight.intensity = 0.55;
    }
  }, [lightingMode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F1F5F9');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.5, 450);
    camera.position.set(14, 72, 94);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 4, 4);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 14;
    controls.maxDistance = 160;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controlsRef.current = controls;

    const onControlStart = () => {
      animatedRefs.current.camAnim = null;
    };
    controls.addEventListener('start', onControlStart);

    const hemiLight = new THREE.HemisphereLight('#FFFFFF', '#CBD5E1', 1.05);
    hemiLight.position.set(0, 80, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#FFFBEB', 2.1);
    sunLight.position.set(46, 72, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 220;
    const d = 76;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight('#E2E8F0', 0.55);
    fillLight.position.set(-48, 36, -42);
    scene.add(fillLight);

    animatedRefs.current.sunLight = sunLight;
    animatedRefs.current.hemiLight = hemiLight;
    animatedRefs.current.fillLight = fillLight;

    // Procedural Facade & Ground Textures
    const mats = {
      plinthBase: new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.7 }),
      plinthTrim: new THREE.MeshStandardMaterial({ color: '#CBD5E1', roughness: 0.55 }),
      plinthShadowBase: new THREE.MeshStandardMaterial({ color: '#94A3B8', roughness: 0.8 }),
      lawn: new THREE.MeshStandardMaterial({ color: '#5A9355', roughness: 0.86 }),
      asphalt: new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.85 }),
      sidewalk: new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.6 }),
      granite: new THREE.MeshStandardMaterial({ color: '#94A3B8', roughness: 0.6 }),
      sandstone: new THREE.MeshStandardMaterial({
        color: '#EFE8DC',
        roughness: 0.65
      }),
      sandstoneTrim: new THREE.MeshStandardMaterial({ color: '#FDFBF7', roughness: 0.5 }),
      terracottaRoof: new THREE.MeshStandardMaterial({ color: '#B91C1C', roughness: 0.6 }),
      whiteColumn: new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.4 }),
      domeWhite: new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.35, metalness: 0.05 }),
      glassClassical: new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.15, metalness: 0.65 }),
      glassDBlock: new THREE.MeshStandardMaterial({ color: '#16202C', roughness: 0.12, metalness: 0.8 }),
      portalWhite: new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.45 }),
      hostelBody: new THREE.MeshStandardMaterial({ color: '#F1ECE1', roughness: 0.65 }),
      metalSilver: new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.35, metalness: 0.8 }),
      metalDark: new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.5, metalness: 0.6 }),
      treeTrunk: new THREE.MeshStandardMaterial({ color: '#6B4F3A', roughness: 0.9 }),
      treeFoliage1: new THREE.MeshStandardMaterial({ color: '#3F7D44', roughness: 0.85, flatShading: true }),
      treeFoliage2: new THREE.MeshStandardMaterial({ color: '#4E8D4E', roughness: 0.82, flatShading: true }),
      treeFoliage3: new THREE.MeshStandardMaterial({ color: '#2D6A4F', roughness: 0.88, flatShading: true }),
      fenceRail: new THREE.MeshStandardMaterial({ color: '#15803D', roughness: 0.4 }),
      fencePost: new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.5 }),
      trafficOrange: new THREE.MeshStandardMaterial({ color: '#F97316', roughness: 0.4 }),
      trafficWhite: new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.4 }),
      bleacherRed: new THREE.MeshStandardMaterial({ color: '#DC2626', roughness: 0.5 }),
      carTire: new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.9 }),
      carRim: new THREE.MeshStandardMaterial({ color: '#CBD5E1', roughness: 0.3, metalness: 0.7 }),
      carGlass: new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.15, metalness: 0.85 }),
      headlight: new THREE.MeshStandardMaterial({ color: '#FEF08A', emissive: '#FEF08A', emissiveIntensity: 0.4 }),
      taillight: new THREE.MeshStandardMaterial({ color: '#DC2626', emissive: '#991B1B', emissiveIntensity: 0.35 }),
      // Textures
      aryabhataFacade: new THREE.MeshStandardMaterial({
        map: createCanvasTexture((ctx, w, h) => {
          ctx.fillStyle = '#EFE8DC';
          ctx.fillRect(0, 0, w, h);
          const floors = 5;
          const cols = 12;
          const floorH = h / floors;
          const colW = w / cols;
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 4;
          for (let f = 0; f < floors; f++) {
            ctx.beginPath();
            ctx.moveTo(0, f * floorH);
            ctx.lineTo(w, f * floorH);
            ctx.stroke();
            for (let c = 0; c < cols; c++) {
              const x = c * colW + colW * 0.2;
              const y = f * floorH + floorH * 0.25;
              const winW = colW * 0.6;
              const winH = floorH * 0.55;
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(x - 2, y - 2, winW + 4, winH + 4);
              ctx.fillStyle = '#1E293B';
              ctx.fillRect(x, y, winW, winH);
              ctx.fillStyle = '#38BDF8';
              ctx.fillRect(x + winW * 0.5, y, 1, winH);
              ctx.fillRect(x, y + winH * 0.5, winW, 1);
            }
          }
        }, 512, 512, 1, 1),
        roughness: 0.6
      }),
      dBlockFacade: new THREE.MeshStandardMaterial({
        map: createCanvasTexture((ctx, w, h) => {
          ctx.fillStyle = '#16202C';
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 1;
          for (let y = 0; y < h; y += 40) {
            ctx.fillStyle = '#1E293B';
            ctx.fillRect(0, y, w, 10);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
          }
          for (let x = 0; x < w; x += 32) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
          }
        }, 512, 512, 2, 2),
        roughness: 0.15,
        metalness: 0.75
      }),
      hostelFacade: new THREE.MeshStandardMaterial({
        map: createCanvasTexture((ctx, w, h) => {
          ctx.fillStyle = '#F1ECE1';
          ctx.fillRect(0, 0, w, h);
          const floors = 6;
          const cols = 8;
          const floorH = h / floors;
          const colW = w / cols;
          for (let f = 0; f < floors; f++) {
            ctx.fillStyle = '#E2D9C8';
            ctx.fillRect(0, (f + 1) * floorH - 6, w, 6);
            for (let c = 0; c < cols; c++) {
              const x = c * colW + colW * 0.18;
              const y = f * floorH + floorH * 0.22;
              const bw = colW * 0.64;
              const bh = floorH * 0.6;
              ctx.fillStyle = '#334155';
              ctx.fillRect(x, y, bw, bh);
              ctx.fillStyle = '#F1ECE1';
              ctx.fillRect(x + 2, y + 2, bw - 4, bh - 6);
              ctx.fillStyle = '#1E293B';
              ctx.fillRect(x + 4, y + 4, bw - 8, bh * 0.45);
              ctx.strokeStyle = '#64748B';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(x + 2, y + bh - 4);
              ctx.lineTo(x + bw - 2, y + bh - 4);
              ctx.stroke();
            }
          }
        }, 512, 512, 2, 1),
        roughness: 0.65
      }),
      footballField: new THREE.MeshStandardMaterial({
        map: createCanvasTexture((ctx, w, h) => {
          const stripes = 12;
          const stripeH = h / stripes;
          for (let i = 0; i < stripes; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#4E8D4E' : '#437943';
            ctx.fillRect(0, i * stripeH, w, stripeH);
          }
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 5;
          ctx.strokeRect(20, 20, w - 40, h - 40);
          ctx.beginPath();
          ctx.moveTo(20, h / 2);
          ctx.lineTo(w - 20, h / 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, 48, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, 6, 0, Math.PI * 2);
          ctx.fill();
          // Top penalty box
          ctx.strokeRect(w / 2 - 80, 20, 160, 75);
          ctx.strokeRect(w / 2 - 40, 20, 80, 30);
          // Bottom penalty box
          ctx.strokeRect(w / 2 - 80, h - 95, 160, 75);
          ctx.strokeRect(w / 2 - 40, h - 50, 80, 30);
        }, 512, 768),
        roughness: 0.85
      }),
      runningTrack: new THREE.MeshStandardMaterial({
        map: createCanvasTexture((ctx, w, h) => {
          ctx.fillStyle = '#C2410C';
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          for (let inset = 8; inset <= 36; inset += 9) {
            ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
          }
        }, 512, 512),
        roughness: 0.82
      }),
      basketballCourt: new THREE.MeshStandardMaterial({
        map: createCanvasTexture((ctx, w, h) => {
          ctx.fillStyle = '#1D4ED8';
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 4;
          ctx.strokeRect(12, 12, w - 24, h - 24);
          ctx.beginPath();
          ctx.moveTo(w / 2, 12);
          ctx.lineTo(w / 2, h - 12);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, 36, 0, Math.PI * 2);
          ctx.stroke();
          // Left and right key
          ctx.strokeRect(12, h / 2 - 32, 52, 64);
          ctx.strokeRect(w - 64, h / 2 - 32, 52, 64);
        }, 512, 256),
        roughness: 0.78
      }),
      solarCell: new THREE.MeshStandardMaterial({
        map: createCanvasTexture((ctx, w, h) => {
          ctx.fillStyle = '#1E3A5F';
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = '#60A5FA';
          ctx.lineWidth = 2;
          for (let x = 0; x <= w; x += 24) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
          }
          for (let y = 0; y <= h; y += 48) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
          }
        }, 256, 256),
        roughness: 0.25,
        metalness: 0.4
      }),
      parkingTexture: new THREE.MeshStandardMaterial({
        map: createCanvasTexture((ctx, w, h) => {
          ctx.fillStyle = '#334155';
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 4;
          for (let x = 20; x < w - 20; x += 44) {
            ctx.beginPath();
            ctx.moveTo(x, 10);
            ctx.lineTo(x, h - 10);
            ctx.stroke();
          }
        }, 256, 128),
        roughness: 0.85
      })
    };

    clickableMeshesRef.current = [];
    buildingGroupsRef.current = {};

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

    // Helper: Ribbed Classical Dome
    const createRibbedDome = (radius: number, drumHeight: number, domeHeight: number) => {
      const g = new THREE.Group();
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.96, radius * 1.02, drumHeight, 24), mats.sandstoneTrim);
      drum.position.y = drumHeight / 2;
      drum.castShadow = true;
      drum.receiveShadow = true;
      g.add(drum);

      const cornice = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.08, radius * 1.04, 0.25, 24), mats.whiteColumn);
      cornice.position.y = drumHeight;
      g.add(cornice);

      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const win = new THREE.Mesh(new THREE.BoxGeometry(radius * 0.32, drumHeight * 0.55, 0.15), mats.glassClassical);
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

      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const ribGeo = new THREE.TorusGeometry(radius * 1.005, 0.05, 6, 18, Math.PI * 0.5);
        ribGeo.scale(1, domeHeight / radius, 1);
        const rib = new THREE.Mesh(ribGeo, mats.sandstoneTrim);
        rib.position.y = drumHeight + 0.08;
        rib.rotation.y = a;
        g.add(rib);
      }

      const lantern = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.16, radius * 0.2, 0.6, 12), mats.whiteColumn);
      lantern.position.y = drumHeight + domeHeight + 0.22;
      g.add(lantern);

      const spire = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.08, 0.9, 10), mats.domeWhite);
      spire.position.y = drumHeight + domeHeight + 0.85;
      g.add(spire);

      return g;
    };

    // Helper: Low-Poly Car
    const createCar = (bodyColor: string, x: number, y: number, z: number, rotY = 0) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.rotation.y = rotY;

      const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.35, metalness: 0.25 });
      // Lower body
      const lower = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 3.2), bodyMat);
      lower.position.y = 0.35;
      lower.castShadow = true;
      lower.receiveShadow = true;
      g.add(lower);

      // Cabin
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.48, 1.7), bodyMat);
      cabin.position.set(0, 0.72, -0.15);
      cabin.castShadow = true;
      g.add(cabin);

      // Windows
      const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.42, 1.6), mats.carGlass);
      windshield.position.set(0, 0.72, -0.15);
      g.add(windshield);

      // Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 12);
      wheelGeo.rotateZ(Math.PI / 2);
      const wheelPos = [
        [-0.8, 0.24, 0.9],
        [0.8, 0.24, 0.9],
        [-0.8, 0.24, -0.9],
        [0.8, 0.24, -0.9]
      ];
      wheelPos.forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(wheelGeo, mats.carTire);
        wheel.position.set(wx, wy, wz);
        wheel.castShadow = true;
        g.add(wheel);
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.19, 8), mats.carRim);
        rim.rotateZ(Math.PI / 2);
        rim.position.set(wx, wy, wz);
        g.add(rim);
      });

      // Lights
      const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 0.05), mats.headlight);
      hl1.position.set(-0.55, 0.35, 1.62);
      const hl2 = hl1.clone();
      hl2.position.x = 0.55;
      g.add(hl1, hl2);

      const tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.1, 0.05), mats.taillight);
      tl1.position.set(-0.55, 0.35, -1.62);
      const tl2 = tl1.clone();
      tl2.position.x = 0.55;
      g.add(tl1, tl2);

      return g;
    };

    // Helper: Low-Poly Bike / Scooter
    const createBike = (x: number, y: number, z: number, rotY = 0) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.rotation.y = rotY;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 1.1), mats.metalDark);
      frame.position.y = 0.32;
      frame.castShadow = true;
      g.add(frame);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.45), mats.carTire);
      seat.position.set(0, 0.52, -0.1);
      g.add(seat);
      const wGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.08, 10);
      wGeo.rotateZ(Math.PI / 2);
      const w1 = new THREE.Mesh(wGeo, mats.carTire);
      w1.position.set(0, 0.16, 0.42);
      const w2 = new THREE.Mesh(wGeo, mats.carTire);
      w2.position.set(0, 0.16, -0.42);
      g.add(w1, w2);
      return g;
    };

    // Helper: Low-Poly Tree
    const createTree = (x: number, y: number, z: number, scale = 1, foliageVariant = 0) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      const trunkH = 1.8 * scale;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.26 * scale, trunkH, 8), mats.treeTrunk);
      trunk.position.y = trunkH / 2;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      g.add(trunk);

      const fMat = foliageVariant === 1 ? mats.treeFoliage2 : foliageVariant === 2 ? mats.treeFoliage3 : mats.treeFoliage1;
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2 * scale, 1), fMat);
      crown.position.y = trunkH + 0.8 * scale;
      crown.castShadow = true;
      crown.rotation.set(Math.random() * 0.4, Math.random() * Math.PI, 0);
      g.add(crown);
      return g;
    };

    // Helper: Solar Panel Array
    const createSolarArray = (width: number, length: number, countX: number, countZ: number) => {
      const g = new THREE.Group();
      const panelW = width / countX;
      const panelL = length / countZ;
      for (let x = 0; x < countX; x++) {
        for (let z = 0; z < countZ; z++) {
          const panel = new THREE.Mesh(new THREE.BoxGeometry(panelW * 0.9, 0.08, panelL * 0.88), mats.solarCell);
          panel.position.set(
            (x - (countX - 1) / 2) * panelW,
            0.35,
            (z - (countZ - 1) / 2) * panelL
          );
          panel.rotation.x = -Math.PI * 0.08;
          panel.castShadow = true;
          g.add(panel);

          const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6), mats.metalSilver);
          leg1.position.set((x - (countX - 1) / 2) * panelW, 0.18, (z - (countZ - 1) / 2) * panelL - 0.2);
          g.add(leg1);
        }
      }
      return g;
    };

    // Helper: Soccer Goal Post
    const createGoalPost = (x: number, y: number, z: number, rotY = 0) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.rotation.y = rotY;
      const postMat = mats.whiteColumn;
      const postRadius = 0.08;
      const postH = 1.6;
      const postW = 3.6;
      const p1 = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, postH, 8), postMat);
      p1.position.set(-postW / 2, postH / 2, 0);
      const p2 = p1.clone();
      p2.position.x = postW / 2;
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, postW, 8), postMat);
      bar.rotateZ(Math.PI / 2);
      bar.position.set(0, postH, 0);
      g.add(p1, p2, bar);
      // Net box
      const net = new THREE.Mesh(
        new THREE.BoxGeometry(postW, postH, 0.8),
        new THREE.MeshStandardMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.25, wireframe: true })
      );
      net.position.set(0, postH / 2, -0.4);
      g.add(net);
      return g;
    };

    // Helper: Basketball Hoop Post
    const createBasketballHoop = (x: number, y: number, z: number, rotY = 0) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.rotation.y = rotY;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.6, 8), mats.metalDark);
      pole.position.y = 1.3;
      g.add(pole);
      const backboard = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.05), mats.whiteColumn);
      backboard.position.set(0, 2.4, 0.35);
      g.add(backboard);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 6, 12), mats.trafficOrange);
      rim.rotateX(Math.PI / 2);
      rim.position.set(0, 2.2, 0.55);
      g.add(rim);
      return g;
    };

    // Helper: Stadium Light Tower
    const createFloodlight = (x: number, y: number, z: number, angle = 0) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.rotation.y = angle;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 12, 8), mats.metalDark);
      pole.position.y = 6;
      pole.castShadow = true;
      g.add(pole);
      const head = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.4), mats.metalDark);
      head.position.set(0, 12, 0.4);
      head.rotation.x = Math.PI * 0.12;
      g.add(head);
      const glow = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 0.1), mats.headlight);
      glow.position.set(0, 12, 0.6);
      glow.rotation.x = Math.PI * 0.12;
      g.add(glow);
      return g;
    };

    // 1. Base Campus Plinth & Ground Infrastructure
    const plinthGroup = new THREE.Group();
    // Shadow bevel base
    plinthGroup.add(makeBox(124, 1.2, 100, mats.plinthShadowBase, 0, -1.8, 0, false, false));
    plinthGroup.add(makeBox(122, 1.4, 98, mats.plinthBase, 0, -0.6, 0, false, true));
    // Plinth lawn surface
    plinthGroup.add(makeBox(120, 0.12, 96, mats.lawn, 0, 0.06, 0, false, true));

    // Outer concrete sidewalk perimeter
    plinthGroup.add(makeBox(118, 0.14, 2.4, mats.sidewalk, 0, 0.08, 46.5, false, true));
    plinthGroup.add(makeBox(118, 0.14, 2.4, mats.sidewalk, 0, 0.08, -46.5, false, true));
    plinthGroup.add(makeBox(2.4, 0.14, 94, mats.sidewalk, -58.5, 0.08, 0, false, true));
    plinthGroup.add(makeBox(2.4, 0.14, 94, mats.sidewalk, 58.5, 0.08, 0, false, true));

    // Boundary Perimeter Fence (White pilasters + green rails)
    const fenceGroup = new THREE.Group();
    const createFenceLine = (x1: number, z1: number, x2: number, z2: number) => {
      const dist = Math.hypot(x2 - x1, z2 - z1);
      const angle = Math.atan2(x2 - x1, z2 - z1);
      const posts = Math.floor(dist / 4.5);
      for (let i = 0; i <= posts; i++) {
        const t = i / posts;
        const px = x1 + (x2 - x1) * t;
        const pz = z1 + (z2 - z1) * t;
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.3, 0.35), mats.fencePost);
        post.position.set(px, 0.65, pz);
        post.castShadow = true;
        fenceGroup.add(post);
      }
      // Horizontal rails
      const rail1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, dist), mats.fenceRail);
      rail1.position.set((x1 + x2) / 2, 0.95, (z1 + z2) / 2);
      rail1.rotation.y = angle;
      const rail2 = rail1.clone();
      rail2.position.y = 0.45;
      fenceGroup.add(rail1, rail2);
    };

    // South perimeter fence with gate opening
    createFenceLine(-58.5, 47, 4, 47);
    createFenceLine(22, 47, 58.5, 47);
    // North, West, East perimeter fences
    createFenceLine(-58.5, -47, 58.5, -47);
    createFenceLine(-58.5, -47, -58.5, 47);
    createFenceLine(58.5, -47, 58.5, 47);
    plinthGroup.add(fenceGroup);
    scene.add(plinthGroup);

    // 2. Main Entrance, Grand Gate & Central Avenue
    const entranceGroup = new THREE.Group();
    // Central Roadway from South Boundary to Aryabhata
    const mainAvenue = makeBox(9.6, 0.14, 42, mats.asphalt, 13, 0.08, 26, false, true);
    entranceGroup.add(mainAvenue);

    // Road dashed center line
    const dashedLineTex = createCanvasTexture((ctx, w, h) => {
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#FFFFFF';
      for (let y = 10; y < h; y += 40) {
        ctx.fillRect(w / 2 - 4, y, 8, 22);
      }
    }, 64, 512, 1, 6);
    const dashedLineMat = new THREE.MeshStandardMaterial({ map: dashedLineTex, roughness: 0.8 });
    entranceGroup.add(makeBox(1.0, 0.15, 42, dashedLineMat, 13, 0.09, 26, false, true));

    // Road sidewalks
    entranceGroup.add(makeBox(1.4, 0.18, 42, mats.sidewalk, 7.5, 0.1, 26, false, true));
    entranceGroup.add(makeBox(1.4, 0.18, 42, mats.sidewalk, 18.5, 0.1, 26, false, true));

    // Gatehouse Canopy Pavilion
    const gateCanopy = new THREE.Group();
    gateCanopy.position.set(13, 0, 42);
    // Red Pillars
    const gPillar1 = makeBox(0.9, 4.2, 0.9, mats.terracottaRoof, -4.8, 2.1, 0);
    const gPillar2 = makeBox(0.9, 4.2, 0.9, mats.terracottaRoof, 4.8, 2.1, 0);
    const gPillar3 = makeBox(0.9, 4.2, 0.9, mats.terracottaRoof, -1.8, 2.1, 0);
    const gPillar4 = makeBox(0.9, 4.2, 0.9, mats.terracottaRoof, 1.8, 2.1, 0);
    gateCanopy.add(gPillar1, gPillar2, gPillar3, gPillar4);

    // White hipped roof canopy
    const roofBase = makeBox(12.4, 0.45, 6.8, mats.whiteColumn, 0, 4.3, 0);
    const roofPeak = new THREE.Mesh(new THREE.ConeGeometry(5.2, 1.8, 4), mats.whiteColumn);
    roofPeak.position.set(0, 5.2, 0);
    roofPeak.rotation.y = Math.PI / 4;
    roofPeak.scale.set(1.5, 1, 0.8);
    gateCanopy.add(roofBase, roofPeak);

    // Security kiosk booth
    const guardKiosk = makeBox(2.2, 2.6, 2.8, mats.sandstoneTrim, 0, 1.3, 0);
    gateCanopy.add(guardKiosk);

    // Boom barriers
    const barrier1 = makeBox(2.8, 0.12, 0.12, mats.trafficOrange, -3.2, 1.1, 1.2);
    barrier1.rotation.z = Math.PI * 0.05;
    const barrier2 = makeBox(2.8, 0.12, 0.12, mats.trafficOrange, 3.2, 1.1, 1.2);
    barrier2.rotation.z = -Math.PI * 0.05;
    gateCanopy.add(barrier1, barrier2);

    // Traffic cones on roadway
    [-2.2, 2.2].forEach((cx) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 8), mats.trafficOrange);
      cone.position.set(cx, 0.28, 2.4);
      gateCanopy.add(cone);
    });
    entranceGroup.add(gateCanopy);

    // Flagpole with Indian National Flag (Tiranga) on Central Median
    const flagGroup = new THREE.Group();
    flagGroup.position.set(13, 0, 36.5);
    const flagBase = makeBox(1.8, 0.35, 1.8, mats.granite, 0, 0.18, 0);
    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 9.5, 12), mats.metalSilver);
    flagPole.position.y = 4.8;
    flagPole.castShadow = true;
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8), mats.trafficOrange);
    finial.position.y = 9.6;
    flagGroup.add(flagBase, flagPole, finial);

    // Indian Flag Texture (Saffron, White with Ashoka Chakra, Green)
    const indianFlagTex = createCanvasTexture((ctx, w, h) => {
      ctx.fillStyle = '#FF9933';
      ctx.fillRect(0, 0, w, h / 3);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, h / 3, w, h / 3);
      ctx.fillStyle = '#138808';
      ctx.fillRect(0, (h / 3) * 2, w, h / 3);

      // Ashoka Chakra
      ctx.strokeStyle = '#000080';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 22, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.lineTo(w / 2 + Math.cos(a) * 22, h / 2 + Math.sin(a) * 22);
        ctx.stroke();
      }
    }, 256, 170);

    const flagGeo = new THREE.PlaneGeometry(2.6, 1.6, 16, 8);
    const flagMat = new THREE.MeshStandardMaterial({
      map: indianFlagTex,
      side: THREE.DoubleSide,
      roughness: 0.6
    });
    const flagMesh = new THREE.Mesh(flagGeo, flagMat);
    flagMesh.position.set(1.35, 8.4, 0);
    flagMesh.castShadow = true;
    flagGroup.add(flagMesh);
    animatedRefs.current.flagMesh = flagMesh;
    animatedRefs.current.flagBasePositions = new Float32Array(flagGeo.attributes.position.array);
    entranceGroup.add(flagGroup);

    // Parking Lots & Parked Cars
    // West Parking Lot (near sports)
    const westParking = makeBox(14, 0.14, 18, mats.parkingTexture, -3, 0.08, 33, false, true);
    entranceGroup.add(westParking);
    entranceGroup.add(createCar('#1E3A8A', -6, 0.08, 30, Math.PI / 2));
    entranceGroup.add(createCar('#B91C1C', -6, 0.08, 34, Math.PI / 2));
    entranceGroup.add(createCar('#1F2937', -6, 0.08, 38, Math.PI / 2));
    entranceGroup.add(createCar('#047857', 0.5, 0.08, 30, -Math.PI / 2));
    entranceGroup.add(createCar('#E2E8F0', 0.5, 0.08, 35, -Math.PI / 2));

    // East Parking Lot
    const eastParking = makeBox(20, 0.14, 18, mats.parkingTexture, 30, 0.08, 33, false, true);
    entranceGroup.add(eastParking);
    entranceGroup.add(createCar('#0F172A', 26, 0.08, 29, Math.PI / 2));
    entranceGroup.add(createCar('#2563EB', 26, 0.08, 33, Math.PI / 2));
    entranceGroup.add(createCar('#DC2626', 34, 0.08, 29, -Math.PI / 2));
    entranceGroup.add(createCar('#94A3B8', 34, 0.08, 34, -Math.PI / 2));

    // Covered Bike / Two-Wheeler Parking Shed on Far East
    const bikeShedGroup = new THREE.Group();
    bikeShedGroup.position.set(46, 0, 34);
    const bikePlinth = makeBox(12, 0.14, 8, mats.asphalt, 0, 0.08, 0);
    bikeShedGroup.add(bikePlinth);
    // Shed posts and red corrugated roof
    for (let bx = -5; bx <= 5; bx += 5) {
      bikeShedGroup.add(makeBox(0.18, 2.4, 0.18, mats.metalDark, bx, 1.2, -3.2));
      bikeShedGroup.add(makeBox(0.18, 2.4, 0.18, mats.metalDark, bx, 1.2, 3.2));
    }
    const shedRoof = makeBox(13, 0.15, 8.4, mats.terracottaRoof, 0, 2.5, 0);
    shedRoof.rotation.x = -Math.PI * 0.03;
    bikeShedGroup.add(shedRoof);
    // Parked bikes & scooters
    for (let bi = -4.2; bi <= 4.2; bi += 1.4) {
      bikeShedGroup.add(createBike(bi, 0.08, -1.2, 0));
      bikeShedGroup.add(createBike(bi, 0.08, 1.2, Math.PI));
    }
    entranceGroup.add(bikeShedGroup);

    registerBuilding('entrance', entranceGroup);
    scene.add(entranceGroup);

    // 3. Aryabhata Block (Central Neoclassical Masterpiece)
    const aryabhataGroup = new THREE.Group();
    aryabhataGroup.position.set(13, 0.14, 13);

    // Base podium & steps
    aryabhataGroup.add(makeBox(31, 0.6, 14, mats.sandstoneTrim, 0, 0.3, 0, true, true));
    // Main 5-story building body
    const aryaBody = new THREE.Mesh(new THREE.BoxGeometry(29, 11.2, 12.4), [
      mats.sandstone,
      mats.sandstone,
      mats.sandstoneTrim,
      mats.sandstone,
      mats.aryabhataFacade,
      mats.aryabhataFacade
    ]);
    aryaBody.position.set(0, 6.2, 0);
    aryaBody.castShadow = true;
    aryaBody.receiveShadow = true;
    aryabhataGroup.add(aryaBody);

    // Terracotta-red pitched roof cap
    const aryaRoof = makeBox(29.6, 0.8, 13, mats.terracottaRoof, 0, 12.2, 0, true, true);
    aryabhataGroup.add(aryaRoof);

    // 5 Classical Domes (1 large center + 4 corner chhatris)
    const mainDome = createRibbedDome(2.6, 1.6, 2.8);
    mainDome.position.set(0, 12.6, 0);
    aryabhataGroup.add(mainDome);

    const cornerCoords = [
      [-13.2, 12.6, -5.2],
      [13.2, 12.6, -5.2],
      [-13.2, 12.6, 5.2],
      [13.2, 12.6, 5.2]
    ];
    cornerCoords.forEach(([cx, cy, cz]) => {
      const cornerDome = createRibbedDome(1.1, 0.9, 1.2);
      cornerDome.position.set(cx, cy, cz);
      aryabhataGroup.add(cornerDome);
    });

    // Neoclassical Grand Portico Entrance (South facade)
    const porticoGroup = new THREE.Group();
    porticoGroup.position.set(0, 0, 6.8);
    // Portico steps
    porticoGroup.add(makeBox(9.6, 0.5, 3.2, mats.sandstoneTrim, 0, 0.25, 0.8));
    // 4 Classical Columns
    for (let c = -3.8; c <= 3.8; c += 2.53) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 5.8, 16), mats.whiteColumn);
      col.position.set(c, 3.2, 2.0);
      col.castShadow = true;
      porticoGroup.add(col);
    }
    // Entablature and Triangular Pediment
    const entablature = makeBox(9.8, 0.5, 2.8, mats.whiteColumn, 0, 6.3, 1.2);
    const pediment = new THREE.Mesh(new THREE.ConeGeometry(5.2, 1.6, 4), mats.terracottaRoof);
    pediment.position.set(0, 7.2, 1.2);
    pediment.rotation.y = Math.PI / 4;
    pediment.scale.set(1.3, 1, 0.35);
    porticoGroup.add(entablature, pediment);
    // Glass double doors
    const entranceDoors = makeBox(3.2, 2.8, 0.2, mats.glassClassical, 0, 1.6, 0.1);
    porticoGroup.add(entranceDoors);
    aryabhataGroup.add(porticoGroup);

    registerBuilding('aryabhata', aryabhataGroup);
    scene.add(aryabhataGroup);

    // 4. D Block (Modern Glass High-Rise Tower)
    const dBlockGroup = new THREE.Group();
    dBlockGroup.position.set(13, 0.14, -28);
    // 7-story tower body
    const dBody = new THREE.Mesh(new THREE.BoxGeometry(24, 16.5, 12.8), [
      mats.dBlockFacade,
      mats.dBlockFacade,
      mats.sandstoneTrim,
      mats.sandstoneTrim,
      mats.dBlockFacade,
      mats.dBlockFacade
    ]);
    dBody.position.set(0, 8.25, 0);
    dBody.castShadow = true;
    dBody.receiveShadow = true;
    dBlockGroup.add(dBody);

    // White cantilevered portal frame (sides and roof)
    const portalTop = makeBox(25.4, 0.9, 13.6, mats.portalWhite, 0, 16.9, 0, true, true);
    const portalLeft = makeBox(0.9, 16.5, 13.6, mats.portalWhite, -12.2, 8.25, 0, true, true);
    const portalRight = makeBox(0.9, 16.5, 13.6, mats.portalWhite, 12.2, 8.25, 0, true, true);
    dBlockGroup.add(portalTop, portalLeft, portalRight);

    // Rooftop Steel Pergola Railing Structure
    const pergolaGroup = new THREE.Group();
    pergolaGroup.position.set(0, 17.3, 0);
    for (let px = -11; px <= 11; px += 4.4) {
      pergolaGroup.add(makeBox(0.12, 1.6, 12.6, mats.metalSilver, px, 0.8, 0));
    }
    dBlockGroup.add(pergolaGroup);

    // Rooftop Solar Photovoltaic Arrays
    const dSolar = createSolarArray(18, 8, 4, 3);
    dSolar.position.set(0, 17.5, 0);
    dBlockGroup.add(dSolar);

    registerBuilding('dblock', dBlockGroup);
    scene.add(dBlockGroup);

    // 5. Bhaskaracharya Block (West Academic Wing)
    const bhaskaraGroup = new THREE.Group();
    bhaskaraGroup.position.set(-3.5, 0.14, -3);
    const bhaskaraBody = new THREE.Mesh(new THREE.BoxGeometry(8.8, 11.2, 18.5), [
      mats.aryabhataFacade,
      mats.aryabhataFacade,
      mats.sandstoneTrim,
      mats.sandstoneTrim,
      mats.aryabhataFacade,
      mats.aryabhataFacade
    ]);
    bhaskaraBody.position.set(0, 5.6, 0);
    bhaskaraBody.castShadow = true;
    bhaskaraBody.receiveShadow = true;
    bhaskaraGroup.add(bhaskaraBody);

    const bRoof = makeBox(9.2, 0.45, 19, mats.sandstoneTrim, 0, 11.4, 0);
    const bSolar = createSolarArray(6.5, 14, 2, 4);
    bSolar.position.set(0, 11.6, 0);
    bhaskaraGroup.add(bRoof, bSolar);

    registerBuilding('bhaskaracharya', bhaskaraGroup);
    scene.add(bhaskaraGroup);

    // 6. Chanakya Block (East Academic Wing)
    const chanakyaGroup = new THREE.Group();
    chanakyaGroup.position.set(29.5, 0.14, -3);
    const chanakyaBody = new THREE.Mesh(new THREE.BoxGeometry(8.8, 11.2, 18.5), [
      mats.aryabhataFacade,
      mats.aryabhataFacade,
      mats.sandstoneTrim,
      mats.sandstoneTrim,
      mats.aryabhataFacade,
      mats.aryabhataFacade
    ]);
    chanakyaBody.position.set(0, 5.6, 0);
    chanakyaBody.castShadow = true;
    chanakyaBody.receiveShadow = true;
    chanakyaGroup.add(chanakyaBody);

    const cRoof = makeBox(9.2, 0.45, 19, mats.sandstoneTrim, 0, 11.4, 0);
    const cSolar = createSolarArray(6.5, 14, 2, 4);
    cSolar.position.set(0, 11.6, 0);
    chanakyaGroup.add(cRoof, cSolar);

    registerBuilding('chanakya', chanakyaGroup);
    scene.add(chanakyaGroup);

    // 7. Boys & Girls Hostels (Far Left Residential Tower)
    const hostelGroup = new THREE.Group();
    hostelGroup.position.set(-46, 0.14, -12);
    // 6-story building with balcony cutouts
    const hBody = new THREE.Mesh(new THREE.BoxGeometry(12.4, 15.6, 26), [
      mats.hostelFacade,
      mats.hostelFacade,
      mats.sandstoneTrim,
      mats.sandstoneTrim,
      mats.hostelFacade,
      mats.hostelFacade
    ]);
    hBody.position.set(0, 7.8, 0);
    hBody.castShadow = true;
    hBody.receiveShadow = true;
    hostelGroup.add(hBody);

    // Rooftop parapet & water tanks
    const hParapet = makeBox(12.8, 0.6, 26.4, mats.sandstoneTrim, 0, 15.9, 0);
    const hPenthouse = makeBox(4.5, 2.2, 6, mats.sandstoneTrim, 0, 17, 0);
    hostelGroup.add(hParapet, hPenthouse);
    // Silver cylindrical water storage tanks
    for (let tz = -8; tz <= 8; tz += 8) {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 1.8, 16), mats.metalSilver);
      tank.position.set(2.5, 16.8, tz);
      tank.castShadow = true;
      hostelGroup.add(tank);
    }
    registerBuilding('hostels', hostelGroup);
    scene.add(hostelGroup);

    // 8. Sports Grounds & Central Field Complex
    const sportsGroup = new THREE.Group();
    sportsGroup.position.set(-24, 0.14, 12);

    // Running Track Oval & Football Field
    const trackPad = makeBox(22, 0.12, 28, mats.runningTrack, 0, 0.06, 6, false, true);
    const footballPitch = makeBox(16, 0.14, 22, mats.footballField, 0, 0.08, 6, false, true);
    sportsGroup.add(trackPad, footballPitch);

    // Soccer Goal Posts at both ends of the pitch
    sportsGroup.add(createGoalPost(0, 0.14, -4.5, 0));
    sportsGroup.add(createGoalPost(0, 0.14, 16.5, Math.PI));

    // Red Spectator Bleachers / Grandstand beside the running track
    const bleacherGroup = new THREE.Group();
    bleacherGroup.position.set(-12.2, 0, 6);
    bleacherGroup.rotation.y = Math.PI / 2;
    for (let tier = 0; tier < 4; tier++) {
      const step = makeBox(16, 0.35, 0.75, mats.bleacherRed, 0, 0.2 + tier * 0.35, -tier * 0.75);
      bleacherGroup.add(step);
    }
    sportsGroup.add(bleacherGroup);

    // Dual FIBA Basketball Courts
    const bCourt1 = makeBox(10.5, 0.14, 7.5, mats.basketballCourt, -4.8, 0.08, -12, false, true);
    const bCourt2 = makeBox(10.5, 0.14, 7.5, mats.basketballCourt, 6.2, 0.08, -12, false, true);
    sportsGroup.add(bCourt1, bCourt2);

    // Basketball hoops
    sportsGroup.add(createBasketballHoop(-9.6, 0.14, -12, Math.PI / 2));
    sportsGroup.add(createBasketballHoop(0, 0.14, -12, -Math.PI / 2));
    sportsGroup.add(createBasketballHoop(1.4, 0.14, -12, Math.PI / 2));
    sportsGroup.add(createBasketballHoop(11, 0.14, -12, -Math.PI / 2));

    // Stadium High-Mast Floodlights
    sportsGroup.add(createFloodlight(-11.5, 0.14, -8, Math.PI * 0.25));
    sportsGroup.add(createFloodlight(11.5, 0.14, -8, -Math.PI * 0.25));
    sportsGroup.add(createFloodlight(-11.5, 0.14, 20, Math.PI * 0.75));
    sportsGroup.add(createFloodlight(11.5, 0.14, 20, -Math.PI * 0.75));

    registerBuilding('sports', sportsGroup);
    scene.add(sportsGroup);

    // 9. Campus Landscaping, Trees & Internal Walkways
    const foliageGroup = new THREE.Group();
    // Trees dotted across campus matching the reference render
    const treePositions: [number, number, number, number, number][] = [
      // Along Sohna Road and Main Gate
      [4, 0.14, 44, 1.1, 0],
      [22, 0.14, 44, 1.0, 1],
      [-12, 0.14, 44, 0.9, 2],
      [-20, 0.14, 44, 1.2, 0],
      [-36, 0.14, 44, 1.1, 1],
      [38, 0.14, 44, 1.0, 0],
      [50, 0.14, 44, 1.2, 2],
      // Around Sports Ground and Bleachers
      [-12, 0.14, 22, 1.0, 1],
      [-12, 0.14, -2, 1.1, 0],
      [-36, 0.14, 12, 1.2, 2],
      [-36, 0.14, -4, 1.0, 0],
      [-24, 0.14, -18, 1.1, 1],
      [-14, 0.14, -18, 0.9, 2],
      // Around Hostels
      [-54, 0.14, -26, 1.2, 0],
      [-54, 0.14, 2, 1.1, 1],
      [-38, 0.14, -34, 1.0, 2],
      // Behind Aryabhata and near D Block
      [-3.5, 0.14, -16, 1.1, 0],
      [29.5, 0.14, -16, 1.1, 1],
      [0, 0.14, -38, 1.2, 2],
      [26, 0.14, -38, 1.1, 0],
      [-20, 0.14, -42, 1.0, 1],
      [42, 0.14, -42, 1.2, 0],
      // Along East Perimeter & Parking
      [46, 0.14, 22, 1.0, 2],
      [52, 0.14, 10, 1.1, 1],
      [52, 0.14, -8, 1.2, 0],
      [52, 0.14, -24, 1.0, 2]
    ];
    treePositions.forEach(([tx, ty, tz, s, fv]) => {
      foliageGroup.add(createTree(tx, ty, tz, s, fv));
    });
    scene.add(foliageGroup);

    // Concrete Pedestrian Pathways Linking Buildings
    const pathwayGroup = new THREE.Group();
    // Path from entrance avenue to sports complex
    pathwayGroup.add(makeBox(18, 0.13, 2.2, mats.sidewalk, -2, 0.08, 12, false, true));
    // Path from sports complex to hostels
    pathwayGroup.add(makeBox(12, 0.13, 2.2, mats.sidewalk, -38, 0.08, 0, false, true));
    // Path linking Aryabhata to Chanakya
    pathwayGroup.add(makeBox(10, 0.13, 2.2, mats.sidewalk, 24, 0.08, 13, false, true));
    // Path linking Aryabhata to Bhaskaracharya
    pathwayGroup.add(makeBox(10, 0.13, 2.2, mats.sidewalk, 2, 0.08, 13, false, true));
    scene.add(pathwayGroup);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const getHitBuildingId = (clientX: number, clientY: number): string | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableMeshesRef.current, false);
      return hits.length > 0 ? (hits[0].object.userData.buildingId as string) : null;
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
      if (Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y) < 5) {
        const hitId = getHitBuildingId(e.clientX, e.clientY);
        if (hitId) handleSelectBuilding(hitId);
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

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

    const tempVec = new THREE.Vector3();
    let animFrameId: number;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      // Camera lerp animation
      if (animatedRefs.current.camAnim) {
        const ca = animatedRefs.current.camAnim;
        ca.progress = Math.min(1, ca.progress + 0.045);
        const ease = 1 - Math.pow(1 - ca.progress, 3);
        camera.position.lerp(ca.targetPos, ease * 0.16 + 0.03);
        controls.target.lerp(ca.targetLook, ease * 0.16 + 0.03);
        if (camera.position.distanceTo(ca.targetPos) < 0.15 && controls.target.distanceTo(ca.targetLook) < 0.15) {
          animatedRefs.current.camAnim = null;
        }
      }
      controls.update();

      // Flag gentle wave animation
      const flag = animatedRefs.current.flagMesh;
      const basePos = animatedRefs.current.flagBasePositions;
      if (flag && basePos) {
        const posAttr = flag.geometry.attributes.position;
        const time = Date.now() * 0.005;
        for (let i = 0; i < posAttr.count; i++) {
          const u = basePos[i * 3]; // X coordinate along flag
          if (u > 0.1) {
            const wave = Math.sin(time + u * 2.8) * (u * 0.14);
            posAttr.setZ(i, wave);
          }
        }
        posAttr.needsUpdate = true;
      }

      // Update 2D Screen Projections for 3D Anchor Labels
      const cw = container.clientWidth || window.innerWidth;
      const ch = container.clientHeight || window.innerHeight;
      CAMPUS_DATA.forEach((b) => {
        const el = labelRefs.current[b.id];
        if (!el) return;
        tempVec.set(b.anchor[0], b.anchor[1], b.anchor[2]);
        tempVec.project(camera);
        if (tempVec.z > 1 || Math.abs(tempVec.x) > 1.2 || Math.abs(tempVec.y) > 1.2) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        } else {
          el.style.opacity = '1';
          el.style.pointerEvents = 'auto';
          el.style.transform = `translate3d(${(tempVec.x * 0.5 + 0.5) * cw}px, ${(-tempVec.y * 0.5 + 0.5) * ch}px, 0) translate(-50%, -100%)`;
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
    <div className={`relative w-full h-full min-h-[600px] overflow-hidden bg-[#F1F5F9] dark:bg-[#0E0E11] rounded-2xl border border-slate-200 dark:border-white/10 select-none font-sans ${className}`}>
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Camera Presets & Lighting Controls Overlay Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 flex-wrap max-w-[calc(100%-48px)] sm:max-w-none">
        <div className="flex items-center gap-1 p-1 bg-white/90 dark:bg-[#0E0E11]/90 backdrop-blur-md rounded-xl border border-slate-200/80 dark:border-[#27272A] shadow-sm">
          <Compass className="w-3.5 h-3.5 text-[#0F766E] ml-2 mr-1 shrink-0 hidden sm:inline" />
          {CAMERA_PRESETS.map((preset) => {
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => flyTo(preset.pos, preset.target, preset.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#0F766E] text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#18181B]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Lighting & Labels Options */}
        <div className="flex items-center gap-1 p-1 bg-white/90 dark:bg-[#0E0E11]/90 backdrop-blur-md rounded-xl border border-slate-200/80 dark:border-[#27272A] shadow-sm">
          <button
            type="button"
            onClick={() => setLightingMode(prev => (prev === 'day' ? 'golden' : 'day'))}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#18181B] transition-colors cursor-pointer"
            title="Toggle Solar Atmosphere"
          >
            {lightingMode === 'golden' ? (
              <>
                <Moon className="w-3 h-3 text-amber-500" />
                <span className="hidden sm:inline">Golden Hour</span>
              </>
            ) : (
              <>
                <Sun className="w-3 h-3 text-amber-500" />
                <span className="hidden sm:inline">Daylight</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowLabels(prev => !prev)}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              showLabels
                ? 'text-[#0F766E] bg-teal-50 dark:bg-teal-950/40'
                : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-[#18181B]'
            }`}
            title="Toggle Building Labels"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">Labels</span>
          </button>
        </div>
      </div>

      {/* Floating 3D Anchor Labels Matching Reference Layout */}
      {showLabels && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {CAMPUS_DATA.map((b) => {
            const isSelected = selectedId === b.id;
            const isHovered = hoveredId === b.id;
            return (
              <button
                key={b.id}
                ref={(el) => { labelRefs.current[b.id] = el; }}
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
                      ? 'bg-white dark:bg-[#18181B] text-[#0F766E] border-[#0F766E] shadow-md'
                      : 'bg-white/95 dark:bg-[#18181B]/95 text-[#0F172A] dark:text-slate-200 border-[#CBD5E1] dark:border-[#27272A] hover:border-[#0F766E]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#0F766E]'}`} />
                  <span>{b.name}</span>
                </div>
                <div className={`w-px h-3 ${isSelected ? 'bg-[#0F766E]' : 'bg-[#64748B]/70'}`} />
                <div className={`w-1.5 h-1.5 rounded-full border border-white ${isSelected ? 'bg-[#0F766E]' : 'bg-[#334155]'}`} />
              </button>
            );
          })}
        </div>
      )}

      {/* Slide-Over Building Inspector Drawer */}
      <aside
        className={`absolute top-4 right-4 bottom-4 w-80 sm:w-88 z-30 bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl flex flex-col transition-transform duration-200 ease-out font-sans ${
          selectedBuilding ? 'translate-x-0' : 'translate-x-[120%] pointer-events-none'
        }`}
      >
        {selectedBuilding && (
          <>
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#0F766E] uppercase tracking-wider block mb-0.5">
                  {selectedBuilding.code}
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {selectedBuilding.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#18181B] transition-colors cursor-pointer"
                title="Close Inspector"
                aria-label="Close Inspector"
              >
                ✕
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-5 flex-1 overflow-y-auto text-xs text-slate-600 dark:text-slate-300 space-y-4">
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                {selectedBuilding.subtitle}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 dark:bg-[#18181B] p-3 rounded-xl border border-slate-200 dark:border-[#27272A]">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase">
                    Floors
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block mt-0.5">
                    {selectedBuilding.floors}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase">
                    Built Area
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block mt-0.5">
                    {selectedBuilding.area}
                  </span>
                </div>
              </div>

              {selectedBuilding.highlights && (
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
                    Architectural Highlights
                  </span>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 list-disc list-inside">
                    {selectedBuilding.highlights.map((h, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Drawer Action Bar: Re-Center, Full Plinth & Report Issue Here */}
            <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-2.5 bg-slate-50/50 dark:bg-[#111115]/50">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => flyTo(selectedBuilding.cameraPos, selectedBuilding.cameraTarget)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#27272A] text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#18181B] transition-colors cursor-pointer text-center"
                >
                  Re-Center Camera
                </button>
                <button
                  type="button"
                  onClick={() => flyTo([14, 72, 94], [0, 4, 4], 'overview')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#27272A] text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#18181B] transition-colors cursor-pointer text-center"
                >
                  Full Plinth
                </button>
              </div>

              {/* Signature Deep Teal Button with 4-Layer Tactile Button Shadows */}
              <button
                type="button"
                onClick={handleReportIssueClick}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0d655e] transition-all duration-200 active:scale-95 cursor-pointer shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]"
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
