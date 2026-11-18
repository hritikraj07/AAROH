import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SmartResolveModal } from './SmartResolveModal';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

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
    anchor: [15, 18.5, 19],
    cameraPos: [15, 24, 54],
    cameraTarget: [15, 6, 19],
    highlights: [
      'Neoclassical cream sandstone south facade (#E8E1D3) with terracotta-red pediment (#B84A39) & 4 fluted columns',
      'North courtyard elevation overlooking the Sunken Garden with blue-grey glass atrium & 6-column portico',
      '5 white ribbed rooftop domes (1 large central cupola + 4 corner domes on windowed drums) & solar arrays',
      'Connects seamlessly to Bhaskaracharya Block (West) and Chanakya Block (East) to form the U-shaped quad'
    ]
  },
  {
    id: 'bhaskaracharya',
    code: 'BLOCK B',
    name: 'Bhaskaracharya Block',
    subtitle: 'School of Engineering & Technology (SOET): CSE, AI/ML & Robotics Labs',
    floors: '5 Stories (G + 4) West Wing',
    area: '1,08,000 sq. ft.',
    anchor: [2, 14.5, 4],
    cameraPos: [-16, 26, 26],
    cameraTarget: [2, 5.5, 4],
    highlights: [
      'Forms the western wing of the U-shaped academic quad bordering the Sunken Garden',
      'West facade directly overlooks the Football Ground & 4-Lane Athletics Track',
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
    anchor: [28, 14.5, 4],
    cameraPos: [50, 26, 26],
    cameraTarget: [28, 5.5, 4],
    highlights: [
      'Forms the eastern wing of the U-shaped academic quad bordering the Sunken Garden',
      'Cream sandstone facade with projecting vertical bay-window towers & rooftop mechanical penthouses',
      'Central Library, Bloomberg Finance Lab, Lecture Theatres & Seminar Halls',
      'Overlooks the Sunken Garden and the central bus park ground in front of D Block'
    ]
  },
  {
    id: 'sunken_garden',
    code: 'COURTYARD',
    name: 'Sunken Garden',
    subtitle: 'Central Landscaped Quad Amphitheater & Curved Promenade',
    floors: 'Central Courtyard',
    area: '42,000 sq. ft.',
    anchor: [15, 2.8, 4],
    cameraPos: [15, 22, -16],
    cameraTarget: [15, 1, 5],
    highlights: [
      'Enclosed inside the U-shaped courtyard formed by Aryabhata, Bhaskaracharya & Chanakya Blocks',
      'Circular central lawn ring intersected by sweeping curved white stone pathways',
      'Bordered by manicured shrubs, vibrant bougainvillea beds & stepped masonry edges',
      'Primary student gathering amphitheater and pedestrian connector across the academic quad'
    ]
  },
  {
    id: 'dblock',
    code: 'BLOCK D',
    name: 'D Block',
    subtitle: 'Contemporary Curtain-Wall Tower, Bus Park Ground & Agricultural Garden',
    floors: '6 Stories (G + 5) + Front Ground',
    area: '1,68,000 sq. ft.',
    anchor: [15, 18.5, -34],
    cameraPos: [15, 26, -2],
    cameraTarget: [15, 5, -24],
    highlights: [
      'Dark slate-blue reflective glass curtain wall (#263C47) with cantilevered cream-grey louver portal frame',
      'Expansive green ground directly in front of D Block lined with rows of yellow KRMU buses',
      'Adjacent Agricultural Garden plots, shade greenhouses & paved car/bus parking apron on the west side',
      'Elevated vantage point overlooking the entire A-B-C quad and Sunken Garden'
    ]
  },
  {
    id: 'hostels',
    code: 'RESIDENCES',
    name: 'Boys & Girls Hostels',
    subtitle: 'Twin North-South Residential Blocks & Front Court Complex',
    floors: '7 Stories (G + 6) Twin Blocks',
    area: '1,65,000 sq. ft.',
    anchor: [-46.5, 19.5, -14],
    cameraPos: [-64, 28, 16],
    cameraTarget: [-38, 6, -8],
    highlights: [
      'Twin 7-story residential blocks strictly aligned along the North-South western campus flank',
      'Sleek cream-white facades with vertical slate-teal stairwell glass bands & rooftop solar heaters',
      'Front ground directly houses the fenced blue court complex (Basketball, 2 Tennis & Badminton courts)',
      'Adjacent blue-roofed dining/utility sheds and hostel bus bay'
    ]
  },
  {
    id: 'sports',
    code: 'ATHLETICS',
    name: 'Sports Area',
    subtitle: 'Football Ground, 4-Lane Track, Basketball, Tennis & Badminton Courts',
    floors: 'Outdoor Sports Complex',
    area: '1,75,000 sq. ft.',
    anchor: [-22, 4.2, 8],
    cameraPos: [-22, 34, 44],
    cameraTarget: [-24, 1, 4],
    highlights: [
      'Regulation green turf Football Ground framed by a curved 4-lane terracotta athletics running track',
      'Enclosed by a tall green chain-link ball-stop perimeter fence adjacent to Bhaskaracharya Block',
      'Front Hostel Court Complex featuring blue acrylic Basketball Court, twin Tennis Courts & Badminton Court',
      'High-mast LED floodlights & spectator perimeter walkways'
    ]
  },
  {
    id: 'entrance',
    code: 'MAIN GATE',
    name: 'Main Entrance',
    subtitle: 'Sohna Road Gatehouse, White Canopy Pavilion, Tiranga Flag & Parking',
    floors: 'Campus Plinth Forecourt',
    area: '88,000 sq. ft.',
    anchor: [15, 9.2, 36],
    cameraPos: [15, 18, 64],
    cameraTarget: [15, 3.5, 31],
    highlights: [
      'White pitched-roof entrance canopy pavilion directly in front of Aryabhata Block with K.R. MANGALAM UNIVERSITY signage',
      'Flanking terracotta brick portal piers & wrought-iron perimeter fencing along Sohna Road',
      'Central topiary median flying the waving Indian National Flag (Tiranga)',
      'Dual interlocking paver parking plazas for cars, two-wheelers & covered bicycle racks'
    ]
  }
];

const CAMERA_PRESETS: CameraPreset[] = [
  { id: 'overview', label: 'Aerial Overview', pos: [0, 68, 86], target: [0, 2, 0] },
  { id: 'sunken', label: 'Sunken Garden & Quad', pos: [15, 22, -16], target: [15, 4, 8] },
  { id: 'dblock_ground', label: 'D Block & Bus Ground', pos: [-6, 26, 2], target: [15, 4, -24] },
  { id: 'hostel_sports', label: 'Hostels & Sports Area', pos: [-56, 30, 24], target: [-28, 3, -2] },
  { id: 'main_gate', label: 'Aryabhata & Main Gate', pos: [15, 20, 58], target: [15, 5, 24] }
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
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const { theme } = useApp();
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
    nightLightsGroup: THREE.Group | null;
    starsMesh: THREE.Points | null;
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
    nightLightsGroup: null,
    starsMesh: null,
    vehiclesGroup: null,
    roofDetailsGroup: null,
    camAnim: null
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>('overview');

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

  // Dynamically sync 3D Day/Night Landscape & Campus Night Illumination with Website Theme
  useEffect(() => {
    const isDark = theme === 'dark';
    const scene = sceneRef.current;
    if (!scene) return;

    scene.background = new THREE.Color(isDark ? '#0F172A' : '#BAE6FD');

    const { sunLight, hemiLight, fillLight, nightLightsGroup, starsMesh } = animatedRefs.current;
    if (nightLightsGroup) nightLightsGroup.visible = isDark;
    if (starsMesh) starsMesh.visible = isDark;

    if (sunLight) {
      sunLight.color.set(isDark ? '#E2E8F0' : '#FFFBEB');
      sunLight.intensity = isDark ? 1.75 : 2.05;
      sunLight.position.set(isDark ? -35 : 44, 75, isDark ? -35 : 48);
    }
    if (hemiLight) {
      hemiLight.color.set(isDark ? '#475569' : '#FFFFFF');
      hemiLight.groundColor.set(isDark ? '#1E293B' : '#CBD5E1');
      hemiLight.intensity = isDark ? 1.25 : 1.05;
    }
    if (fillLight) {
      fillLight.color.set(isDark ? '#64748B' : '#E2E8F0');
      fillLight.intensity = isDark ? 1.05 : 0.55;
      fillLight.position.set(isDark ? 45 : -48, isDark ? 50 : 36, isDark ? 45 : -42);
    }
  }, [theme]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const isDarkInit = document.documentElement.classList.contains('dark') || theme === 'dark';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDarkInit ? '#0F172A' : '#BAE6FD');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.5, 450);
    camera.position.set(0, 68, 86);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

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

    const hemiLight = new THREE.HemisphereLight(
      isDarkInit ? '#1E293B' : '#FFFFFF',
      isDarkInit ? '#0A0F1D' : '#CBD5E1',
      isDarkInit ? 0.45 : 1.05
    );
    hemiLight.position.set(0, 80, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(
      isDarkInit ? '#C7D2FE' : '#FFFBEB',
      isDarkInit ? 0.85 : 2.05
    );
    sunLight.position.set(isDarkInit ? -44 : 44, 75, isDarkInit ? -48 : 48);
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

    const fillLight = new THREE.DirectionalLight(
      isDarkInit ? '#64748B' : '#E2E8F0',
      isDarkInit ? 1.05 : 0.55
    );
    fillLight.position.set(isDarkInit ? 45 : -48, isDarkInit ? 50 : 36, isDarkInit ? 45 : -42);
    scene.add(fillLight);

    // Campus Night Lighting Group (automatically turns ON in Night Mode to illuminate campus)
    const nightLightsGroup = new THREE.Group();
    
    const addCampusLamp = (x: number, y: number, z: number, color = '#FEF08A', intensity = 3.4, distance = 44) => {
      const pl = new THREE.PointLight(color, intensity, distance, 1.2);
      pl.position.set(x, y, z);
      nightLightsGroup.add(pl);
      
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 12, 12),
        new THREE.MeshBasicMaterial({ color: color })
      );
      bulb.position.set(x, y, z);
      nightLightsGroup.add(bulb);
    };

    // 1. Aryabhata Entrance Colonnade & Central Dome
    addCampusLamp(15, 6.5, 26, '#FDE68A', 4.0, 48);
    addCampusLamp(15, 21.0, 19, '#FEF3C7', 3.5, 40);

    // 2. Sunken Garden Quad & Central Promenade
    addCampusLamp(15, 3.8, 4, '#FEF08A', 3.8, 45);

    // 3. Bhaskaracharya Block (West Quad)
    addCampusLamp(2, 5.5, 4, '#FDE68A', 3.4, 40);

    // 4. Chanakya Block (East Quad)
    addCampusLamp(28, 5.5, 4, '#FDE68A', 3.4, 40);

    // 5. D Block Modern Curtain-Wall Facade & Plaza
    addCampusLamp(15, 6.0, -28, '#BAE6FD', 4.2, 50);

    // 6. Sports Complex Floodlights
    addCampusLamp(-18, 14.0, 6, '#FFFFFF', 4.5, 60);

    // 7. Hostels Residential Court
    addCampusLamp(-36, 6.5, -14, '#FDE68A', 3.6, 45);

    // 8. Main Entrance Sohna Road Gatehouse
    addCampusLamp(15, 5.5, 36, '#FEF3C7', 3.4, 42);

    nightLightsGroup.visible = isDarkInit;
    scene.add(nightLightsGroup);

    // 3D Stars Field (Night Mode)
    const starCount = 900;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * (Math.PI / 2.3);
      const radius = 135 + Math.random() * 25;
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.cos(phi) + 10;
      starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 1.4,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: false
    });
    const starsPoints = new THREE.Points(starGeometry, starMaterial);
    starsPoints.visible = isDarkInit;
    scene.add(starsPoints);

    animatedRefs.current.sunLight = sunLight;
    animatedRefs.current.hemiLight = hemiLight;
    animatedRefs.current.fillLight = fillLight;
    animatedRefs.current.nightLightsGroup = nightLightsGroup;
    animatedRefs.current.starsMesh = starsPoints;

    const mats = {
      plinthBase: new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.7 }),
      plinthTrim: new THREE.MeshStandardMaterial({ color: '#CBD5E1', roughness: 0.55 }),
      plinthShadowBase: new THREE.MeshStandardMaterial({ color: '#94A3B8', roughness: 0.8 }),
      lawn: new THREE.MeshStandardMaterial({ color: '#659B5E', roughness: 0.88 }),
      lawnDark: new THREE.MeshStandardMaterial({ color: '#4E8248', roughness: 0.9 }),
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
      bougainvillea: new THREE.MeshStandardMaterial({ color: '#BE185D', roughness: 0.8 }),
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
      shedBlue: new THREE.MeshStandardMaterial({ color: '#38BDF8', roughness: 0.42, metalness: 0.35 }),
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
      fenceGreen: new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.5, metalness: 0.4 }),
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

    // 1. ARCHITECTURAL SCALE-MODEL PLINTH (120 x 96 units)
    const plinthGroup = new THREE.Group();

    plinthGroup.add(makeBox(118.4, 1.0, 94.4, mats.plinthShadowBase, 0, -1.7, 0, false, false));
    plinthGroup.add(makeBox(120, 1.2, 96, mats.plinthBase, 0, -0.6, 0, false, true));
    plinthGroup.add(makeBox(120.4, 0.35, 0.6, mats.plinthTrim, 0, 0.05, 48.0, false, true));
    plinthGroup.add(makeBox(120.4, 0.35, 0.6, mats.plinthTrim, 0, 0.05, -48.0, false, true));
    plinthGroup.add(makeBox(0.6, 0.35, 96.4, mats.plinthTrim, -60.0, 0.05, 0, false, true));
    plinthGroup.add(makeBox(0.6, 0.35, 96.4, mats.plinthTrim, 60.0, 0.05, 0, false, true));

    plinthGroup.add(makeBox(118, 0.12, 94, mats.lawn, 0, 0.06, 0, false, true));

    // Internal Campus Ring Roads & Walkways
    plinthGroup.add(makeBox(68.0, 0.15, 3.2, mats.sidewalk, 6, 0.075, -7.8, false, true));
    plinthGroup.add(makeBox(36.0, 0.15, 2.8, mats.sidewalk, 15, 0.075, -26.2, false, true));
    plinthGroup.add(makeBox(2.8, 0.15, 20.5, mats.sidewalk, -1.5, 0.075, -17.0, false, true));
    plinthGroup.add(makeBox(2.8, 0.15, 20.5, mats.sidewalk, 31.5, 0.075, -17.0, false, true));

    plinthGroup.add(makeBox(108, 0.16, 3.8, mats.sidewalk, 0, 0.08, 26.2, false, true));
    plinthGroup.add(makeBox(3.4, 0.16, 82, mats.sidewalk, -38.8, 0.08, -2, false, true));
    plinthGroup.add(makeBox(114, 0.15, 2.2, mats.sidewalk, 0, 0.075, -44.5, false, true));
    plinthGroup.add(makeBox(2.2, 0.15, 88, mats.sidewalk, 55.5, 0.075, -1, false, true));

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

    buildFenceRun(-58.5, 45.8, 7.6, 45.8);
    buildFenceRun(22.4, 45.8, 58.5, 45.8);
    buildFenceRun(-58.5, -46.5, -58.5, 45.8);
    buildFenceRun(58.5, -46.5, 58.5, 45.8);
    buildFenceRun(-58.5, -46.5, 58.5, -46.5);

    scene.add(plinthGroup);

    // 2. ARYABHATA BLOCK (BLOCK A)
    const aryabhataGroup = new THREE.Group();
    aryabhataGroup.position.set(15, 0.16, 19);

    aryabhataGroup.add(makeBox(30.4, 0.7, 11.8, mats.granite, 0, 0.35, 0, true, true));

    for (let s = 0; s < 5; s++) {
      aryabhataGroup.add(
        makeBox(11.4 - s * 0.2, 0.14, 2.4 - s * 0.36, mats.granite, 0, 0.07 + s * 0.14, 6.5 - s * 0.14, true, true)
      );
    }

    const aryaH = 11.4;
    const aryaBaseY = 0.7;
    aryabhataGroup.add(makeBox(29.0, aryaH, 10.6, mats.sandstone, 0, aryaBaseY + aryaH / 2, 0, true, true));

    aryabhataGroup.add(makeBox(6.6, aryaH + 0.3, 11.2, mats.sandstone, -11.2, aryaBaseY + (aryaH + 0.3) / 2, 0, true, true));
    aryabhataGroup.add(makeBox(6.6, aryaH + 0.3, 11.2, mats.sandstone, 11.2, aryaBaseY + (aryaH + 0.3) / 2, 0, true, true));

    for (let f = 1; f <= 5; f++) {
      const cy = aryaBaseY + f * 2.24;
      aryabhataGroup.add(makeBox(29.5, 0.22, 11.5, mats.sandstoneTrim, 0, cy, 0, true, true));
    }

    for (let cx = -13.6; cx <= 13.6; cx += 2.26) {
      if (Math.abs(cx) < 4.8) continue;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 2.2, 14), mats.whiteColumn);
      col.position.set(cx, aryaBaseY + 1.1, 5.55);
      col.castShadow = true;
      aryabhataGroup.add(col);
    }

    for (let f = 0; f < 5; f++) {
      const wy = aryaBaseY + 1.15 + f * 2.24;
      for (let wx = -13.2; wx <= 13.2; wx += 2.2) {
        if (f === 0 && Math.abs(wx) < 5.0) continue;
        if (f === 1 && Math.abs(wx) < 4.5) continue;
        aryabhataGroup.add(makeBox(1.18, 1.38, 0.18, mats.sandstoneTrim, wx, wy, 5.62, false, false));
        aryabhataGroup.add(makeBox(0.96, 1.18, 0.22, mats.glassClassical, wx, wy, 5.64, false, false));
        if (Math.abs(wx) > 5.4) {
          aryabhataGroup.add(makeBox(0.96, 1.18, 0.2, mats.glassClassical, wx, wy, -5.62, false, false));
        }
      }
      for (let wz = -4.0; wz <= 4.0; wz += 2.0) {
        aryabhataGroup.add(makeBox(0.2, 1.18, 0.95, mats.glassClassical, -14.55, wy, wz, false, false));
        aryabhataGroup.add(makeBox(0.2, 1.18, 0.95, mats.glassClassical, 14.55, wy, wz, false, false));
      }
    }

    aryabhataGroup.add(makeBox(7.6, 3.9, 0.3, mats.glassClassical, 0, aryaBaseY + 1.95, 5.35, false, false));
    const porticoZ = 6.65;
    aryabhataGroup.add(makeBox(9.6, 0.36, 2.7, mats.sandstoneTrim, 0, aryaBaseY + 4.55, 6.0, true, true));
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
      depth: 2.5,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 2
    });
    const pediment = new THREE.Mesh(pedGeo, mats.terracotta);
    pediment.position.set(0, aryaBaseY + 4.75, 4.75);
    pediment.castShadow = true;
    aryabhataGroup.add(pediment);
    aryabhataGroup.add(makeBox(10.5, 0.22, 2.7, mats.whiteColumn, 0, aryaBaseY + 4.72, 6.1, true, true));

    const northAtriumW = 10.6;
    aryabhataGroup.add(makeBox(northAtriumW, aryaH, 0.35, mats.glassCourtyard, 0, aryaBaseY + aryaH / 2, -5.35, false, false));
    for (let fy = 1; fy <= 5; fy++) {
      aryabhataGroup.add(makeBox(northAtriumW + 0.1, 0.12, 0.42, mats.sandstoneTrim, 0, aryaBaseY + fy * 2.24, -5.38, false, false));
    }
    for (let mx = -5.0; mx <= 5.0; mx += 2.0) {
      aryabhataGroup.add(makeBox(0.1, aryaH, 0.42, mats.sandstoneTrim, mx, aryaBaseY + aryaH / 2, -5.38, false, false));
    }

    const podiumW = 10.8;
    const podiumD = 2.2;
    const podiumH = 2.15;
    aryabhataGroup.add(makeBox(podiumW, podiumH, podiumD, mats.whiteColumn, 0, aryaBaseY + podiumH / 2, -5.4 - podiumD / 2, true, true));
    aryabhataGroup.add(makeBox(podiumW - 0.5, podiumH - 0.45, podiumD + 0.08, mats.glassClassical, 0, aryaBaseY + podiumH / 2, -5.4 - podiumD / 2, false, false));
    for (let px = -5.1; px <= 5.1; px += 1.02) {
      aryabhataGroup.add(makeBox(0.14, podiumH, 0.16, mats.whiteColumn, px, aryaBaseY + podiumH / 2, -5.4 - podiumD - 0.04, false, false));
    }

    const nColZ = -5.4 - podiumD + 0.35;
    const nColBaseY = aryaBaseY + podiumH;
    const nColH = 6.25;
    [-4.6, -2.76, -0.92, 0.92, 2.76, 4.6].forEach((cx) => {
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, nColH, 14), mats.whiteColumn);
      shaft.position.set(cx, nColBaseY + nColH / 2, nColZ);
      shaft.castShadow = true;
      aryabhataGroup.add(shaft);
    });
    aryabhataGroup.add(makeBox(10.6, 0.34, 2.1, mats.sandstoneTrim, 0, nColBaseY + nColH + 0.15, -5.4 - podiumD / 2, true, true));
    const nPedShape = new THREE.Shape();
    nPedShape.moveTo(-5.2, 0);
    nPedShape.lineTo(5.2, 0);
    nPedShape.lineTo(0, 1.95);
    nPedShape.closePath();
    const nPedGeo = new THREE.ExtrudeGeometry(nPedShape, {
      depth: 2.0,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 2
    });
    const nPediment = new THREE.Mesh(nPedGeo, mats.sandstoneTrim);
    nPediment.position.set(0, nColBaseY + nColH + 0.32, -5.4 - podiumD + 0.05);
    nPediment.castShadow = true;
    aryabhataGroup.add(nPediment);

    const aryaRoofY = aryaBaseY + aryaH + 0.3;
    aryabhataGroup.add(makeBox(29.4, 0.65, 11.4, mats.sandstoneTrim, 0, aryaRoofY + 0.32, 0, true, true));
    aryabhataGroup.add(makeBox(29.6, 0.22, 11.6, mats.terracotta, 0, aryaRoofY + 0.68, 0, false, false));

    const mainDome = createRibbedDome(2.45, 1.55, 2.65);
    mainDome.position.set(0, aryaRoofY + 0.4, 0);
    aryabhataGroup.add(mainDome);

    [
      [-11.2, -3.4],
      [11.2, -3.4],
      [-11.2, 3.4],
      [11.2, 3.4]
    ].forEach(([dx, dz]) => {
      const sd = createRibbedDome(1.22, 0.95, 1.38);
      sd.position.set(dx, aryaRoofY + 0.4, dz);
      aryabhataGroup.add(sd);
    });

    registerBuilding('aryabhata', aryabhataGroup);
    scene.add(aryabhataGroup);

    addSolarArray(aryabhataGroup, -6.2, aryaRoofY + 0.4, -2.5, 2, 3);
    addSolarArray(aryabhataGroup, 6.2, aryaRoofY + 0.4, -2.5, 2, 3);
    addHvacUnit(aryabhataGroup, -6.2, aryaRoofY + 0.4, 2.6);
    addHvacUnit(aryabhataGroup, 6.2, aryaRoofY + 0.4, 2.6);

    // 3. BHASKARACHARYA BLOCK (BLOCK B)
    const bhaskaraGroup = new THREE.Group();
    bhaskaraGroup.position.set(2, 0.16, 4.2);

    const wingH = 11.2;
    const wingW = 7.8;
    const wingD = 18.6;

    bhaskaraGroup.add(makeBox(wingW, wingH, wingD, mats.sandstone, 0, wingH / 2, 0, true, true));
    bhaskaraGroup.add(makeBox(3.2, wingH + 1.4, 3.6, mats.sandstoneTrim, -1.4, (wingH + 1.4) / 2, -wingD / 2 + 1.1, true, true));
    bhaskaraGroup.add(makeBox(2.0, wingH + 0.8, 3.2, mats.sandstoneTrim, wingW / 2 + 0.75, (wingH + 0.8) / 2, -4.6, true, true));
    bhaskaraGroup.add(makeBox(2.0, wingH + 0.8, 3.2, mats.sandstoneTrim, wingW / 2 + 0.75, (wingH + 0.8) / 2, 2.0, true, true));

    for (let f = 1; f <= 5; f++) {
      const cy = f * 2.22;
      bhaskaraGroup.add(makeBox(wingW + 0.3, 0.18, wingD + 0.3, mats.sandstoneTrim, 0, cy, 0, false, true));
    }

    for (let f = 0; f < 5; f++) {
      const wy = 1.12 + f * 2.22;
      for (let wz = -7.6; wz <= 7.6; wz += 2.2) {
        bhaskaraGroup.add(makeBox(0.18, 1.22, 1.05, mats.glassClassical, -wingW / 2 - 0.04, wy, wz, false, false));
        bhaskaraGroup.add(makeBox(0.18, 1.22, 1.05, mats.glassClassical, wingW / 2 + 0.04, wy, wz, false, false));
      }
      [-2.0, 0.3, 2.3].forEach((wx) => {
        bhaskaraGroup.add(makeBox(1.1, 1.22, 0.18, mats.glassClassical, wx, wy, -wingD / 2 - 0.65, false, false));
      });
      bhaskaraGroup.add(makeBox(0.2, 1.15, 2.2, mats.glassClassical, wingW / 2 + 1.78, wy, -4.6, false, false));
      bhaskaraGroup.add(makeBox(0.2, 1.15, 2.2, mats.glassClassical, wingW / 2 + 1.78, wy, 2.0, false, false));
    }

    bhaskaraGroup.add(makeBox(wingW + 0.4, 0.5, wingD + 0.4, mats.sandstoneTrim, 0, wingH + 0.25, 0, true, true));
    bhaskaraGroup.add(makeBox(3.4, 1.8, 3.6, mats.sandstoneTrim, -1.4, wingH + 1.6, -wingD / 2 + 1.1, true, true));

    registerBuilding('bhaskaracharya', bhaskaraGroup);
    scene.add(bhaskaraGroup);

    addSolarArray(bhaskaraGroup, 0.7, wingH + 0.45, -1.5, 3, 2);
    addSolarArray(bhaskaraGroup, 0.7, wingH + 0.45, 4.8, 2, 2);
    addHvacUnit(bhaskaraGroup, -1.4, wingH + 0.45, 3.6);

    // 4. CHANAKYA BLOCK (BLOCK C)
    const chanakyaGroup = new THREE.Group();
    chanakyaGroup.position.set(28, 0.16, 4.2);

    chanakyaGroup.add(makeBox(wingW, wingH, wingD, mats.sandstone, 0, wingH / 2, 0, true, true));
    chanakyaGroup.add(makeBox(3.2, wingH + 1.6, 3.6, mats.sandstoneTrim, 1.4, (wingH + 1.6) / 2, -wingD / 2 + 1.1, true, true));
    chanakyaGroup.add(makeBox(2.0, wingH + 0.8, 3.2, mats.sandstoneTrim, -wingW / 2 - 0.75, (wingH + 0.8) / 2, -4.6, true, true));
    chanakyaGroup.add(makeBox(2.0, wingH + 0.8, 3.2, mats.sandstoneTrim, -wingW / 2 - 0.75, (wingH + 0.8) / 2, 2.0, true, true));

    for (let f = 1; f <= 5; f++) {
      const cy = f * 2.22;
      chanakyaGroup.add(makeBox(wingW + 0.3, 0.18, wingD + 0.3, mats.sandstoneTrim, 0, cy, 0, false, true));
    }

    for (let f = 0; f < 5; f++) {
      const wy = 1.12 + f * 2.22;
      for (let wz = -7.6; wz <= 7.6; wz += 2.2) {
        chanakyaGroup.add(makeBox(0.18, 1.22, 1.05, mats.glassClassical, -wingW / 2 - 0.04, wy, wz, false, false));
        chanakyaGroup.add(makeBox(0.18, 1.22, 1.05, mats.glassClassical, wingW / 2 + 0.04, wy, wz, false, false));
      }
      [-2.3, -0.3, 2.0].forEach((wx) => {
        chanakyaGroup.add(makeBox(1.1, 1.22, 0.18, mats.glassClassical, wx, wy, -wingD / 2 - 0.65, false, false));
      });
      chanakyaGroup.add(makeBox(0.2, 1.15, 2.2, mats.glassClassical, -wingW / 2 - 1.78, wy, -4.6, false, false));
      chanakyaGroup.add(makeBox(0.2, 1.15, 2.2, mats.glassClassical, -wingW / 2 - 1.78, wy, 2.0, false, false));
    }

    chanakyaGroup.add(makeBox(wingW + 0.4, 0.5, wingD + 0.4, mats.sandstoneTrim, 0, wingH + 0.25, 0, true, true));
    chanakyaGroup.add(makeBox(3.4, 2.0, 3.6, mats.sandstoneTrim, 1.4, wingH + 1.7, -wingD / 2 + 1.1, true, true));

    registerBuilding('chanakya', chanakyaGroup);
    scene.add(chanakyaGroup);

    addSolarArray(chanakyaGroup, -0.7, wingH + 0.45, -1.5, 3, 2);
    addSolarArray(chanakyaGroup, -0.7, wingH + 0.45, 4.8, 2, 2);
    addHvacUnit(chanakyaGroup, 1.4, wingH + 0.45, 3.6);

    // 4B. SUNKEN GARDEN
    const sunkenGroup = new THREE.Group();
    sunkenGroup.position.set(15, 0.16, 4.2);

    const sgW = 16.4;
    const sgD = 18.2;

    sunkenGroup.add(makeBox(sgW + 0.8, 0.36, sgD + 0.8, mats.sandstoneDark, 0, 0.18, 0, true, true));

    const sunkenTex = createCanvasTexture(
      (ctx, w, h) => {
        ctx.fillStyle = '#538E45';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#5B984C';
        for (let y = 0; y < h; y += 36) {
          ctx.fillRect(0, y, w, 18);
        }

        ctx.strokeStyle = '#F1F5F9';
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 165, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(w * 0.5, 0);
        ctx.bezierCurveTo(w * 0.18, h * 0.34, w * 0.82, h * 0.66, w * 0.46, h);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(w * 0.22, h * 0.12);
        ctx.quadraticCurveTo(w * 0.52, h * 0.48, w * 0.84, h * 0.88);
        ctx.stroke();

        ctx.fillStyle = '#E2E8F0';
        ctx.beginPath();
        ctx.arc(w * 0.38, h * 0.68, 22, 0, Math.PI * 2);
        ctx.fill();
      },
      512,
      512
    );

    const sunkenLawn = new THREE.Mesh(
      new THREE.BoxGeometry(sgW, 0.22, sgD),
      new THREE.MeshStandardMaterial({ map: sunkenTex, roughness: 0.84 })
    );
    sunkenLawn.position.y = 0.11;
    sunkenLawn.receiveShadow = true;
    sunkenGroup.add(sunkenLawn);

    [-sgW / 2 + 0.75, sgW / 2 - 0.75].forEach((bx) => {
      for (let bz = -7.2; bz <= 7.2; bz += 2.4) {
        const isFlowering = Math.abs(Math.round(bz)) % 2 === 0;
        const bush = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.68, 1),
          isFlowering ? mats.bougainvillea : mats.treeFoliage1
        );
        bush.position.set(bx, 0.62, bz);
        bush.castShadow = true;
        sunkenGroup.add(bush);
      }
    });

    sunkenGroup.add(makeBox(13.5, 0.62, 0.75, mats.lawnDark, 0, 0.31, -sgD / 2 - 0.15, true, true));

    registerBuilding('sunken_garden', sunkenGroup);
    scene.add(sunkenGroup);

    // 5. D BLOCK & FRONT GROUND
    const dBlockGroup = new THREE.Group();
    dBlockGroup.position.set(15, 0.16, -34);

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

    const dFrontFieldTex = createCanvasTexture(
      (ctx, w, h) => {
        ctx.fillStyle = '#538E45';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#5E9B4E';
        for (let y = 0; y < h; y += 28) {
          ctx.fillRect(0, y, w, 14);
        }
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.55)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.5, 44, 0, Math.PI * 2);
        ctx.stroke();
      },
      512,
      384
    );
    const dFrontGround = new THREE.Mesh(
      new THREE.BoxGeometry(29.5, 0.15, 15.2),
      new THREE.MeshStandardMaterial({ map: dFrontFieldTex, roughness: 0.88 })
    );
    dFrontGround.position.set(0, 0.02, 17.0);
    dFrontGround.receiveShadow = true;
    dBlockGroup.add(dFrontGround);

    registerBuilding('dblock', dBlockGroup);
    scene.add(dBlockGroup);

    // Agricultural Garden plots & shade greenhouses placed in open ground beside D Block
    const agriGroup = new THREE.Group();
    agriGroup.position.set(-18.0, 0.14, -23.0);

    const agriTex = createCanvasTexture(
      (ctx, w, h) => {
        ctx.fillStyle = '#855E42';
        ctx.fillRect(0, 0, w, h);
        const colors = ['#4D8B31', '#65A30D', '#3F6212', '#84CC16'];
        for (let r = 0; r < 6; r++) {
          for (let c = 0; c < 4; c++) {
            ctx.fillStyle = colors[(r + c) % colors.length];
            ctx.fillRect(c * (w / 4) + 8, r * (h / 6) + 6, w / 4 - 16, h / 6 - 12);
          }
        }
      },
      256,
      256
    );
    const agriPlot = new THREE.Mesh(
      new THREE.BoxGeometry(11.5, 0.16, 10.5),
      new THREE.MeshStandardMaterial({ map: agriTex, roughness: 0.9 })
    );
    agriPlot.position.set(0, 0.02, 0);
    agriPlot.receiveShadow = true;
    agriGroup.add(agriPlot);

    [-2.3, 2.3].forEach((gx) => {
      const gh = new THREE.Mesh(
        new THREE.CylinderGeometry(1.35, 1.35, 4.4, 14, 1, false, 0, Math.PI),
        mats.whiteColumn
      );
      gh.rotation.z = Math.PI / 2;
      gh.rotation.y = Math.PI / 2;
      gh.position.set(gx, 0.1, -6.8);
      gh.castShadow = true;
      agriGroup.add(gh);
    });

    agriGroup.add(makeBox(12.5, 0.16, 2.4, mats.paver, 0, 0.02, 6.2, false, true));
    scene.add(agriGroup);

    addSolarArray(dBlockGroup, -5.5, dRoofY + 0.35, 0, 2, 4);
    addSolarArray(dBlockGroup, 5.5, dRoofY + 0.35, 0, 2, 4);

    // 6. BOYS & GIRLS HOSTELS
    const hostelGroup = new THREE.Group();
    hostelGroup.position.set(-49.5, 0.16, -14);

    const buildHostelBlock = (zCenter: number) => {
      const tGroup = new THREE.Group();
      tGroup.position.set(0, 0, zCenter);
      const tW = 10.6;
      const tD = 22.0;
      const tH = 15.8;

      tGroup.add(makeBox(tW, tH, tD, mats.hostelBody, 0, tH / 2, 0, true, true));

      [-6.5, 6.5].forEach((sz) => {
        tGroup.add(makeBox(0.32, tH + 0.2, 1.65, mats.hostelSlate, tW / 2 + 0.12, tH / 2, sz, true, true));
        tGroup.add(makeBox(0.32, tH + 0.2, 1.65, mats.hostelSlate, -tW / 2 - 0.12, tH / 2, sz, true, true));
      });
      tGroup.add(makeBox(0.28, tH, 0.9, mats.terracotta, tW / 2 + 0.08, tH / 2, 0, true, true));
      tGroup.add(makeBox(0.28, tH, 0.9, mats.terracotta, -tW / 2 - 0.08, tH / 2, 0, true, true));

      for (let f = 0; f < 7; f++) {
        const fy = 0.2 + f * 2.22;
        tGroup.add(makeBox(tW + 0.8, 0.18, tD + 0.3, mats.sandstoneTrim, 0, fy, 0, true, true));

        [-9.2, -3.2, 3.2, 9.2].forEach((bz) => {
          tGroup.add(makeBox(0.16, 1.45, 2.7, mats.glassClassical, tW / 2 + 0.02, fy + 0.95, bz, false, false));
          tGroup.add(makeBox(0.16, 1.45, 2.7, mats.glassClassical, -tW / 2 - 0.02, fy + 0.95, bz, false, false));
          tGroup.add(makeBox(0.14, 0.72, 3.0, mats.whiteColumn, tW / 2 + 0.36, fy + 0.45, bz, true, true));
          tGroup.add(makeBox(0.14, 0.72, 3.0, mats.whiteColumn, -tW / 2 - 0.36, fy + 0.45, bz, true, true));
        });
      }

      tGroup.add(makeBox(tW + 0.5, 0.55, tD + 0.5, mats.sandstoneTrim, 0, tH + 0.275, 0, true, true));
      [-6.5, 6.5].forEach((tz) => {
        tGroup.add(makeBox(3.2, 2.0, 3.0, mats.hostelBody, 0, tH + 1.0, tz, true, true));
        [-1.5, 1.5].forEach((tx) => {
          const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 1.5, 16), mats.whiteColumn);
          tank.position.set(tx, tH + 1.05, tz + (tz > 0 ? -2.7 : 2.7));
          tank.castShadow = true;
          tGroup.add(tank);
        });
      });

      return tGroup;
    };

    hostelGroup.add(buildHostelBlock(-13.8));
    hostelGroup.add(buildHostelBlock(13.8));

    hostelGroup.add(makeBox(5.0, 4.4, 5.4, mats.hostelBody, 0, 7.8, 0, true, true));
    hostelGroup.add(makeBox(5.3, 0.35, 5.4, mats.hostelSlate, 0, 10.1, 0, true, true));
    hostelGroup.add(makeBox(5.12, 1.35, 3.4, mats.glassClassical, 0, 6.7, 0, false, false));
    hostelGroup.add(makeBox(5.12, 1.35, 3.4, mats.glassClassical, 0, 8.9, 0, false, false));
    [-1.8, 1.8].forEach((bx) => {
      hostelGroup.add(makeBox(0.55, 5.6, 0.55, mats.sandstoneTrim, bx, 2.8, 0, true, true));
    });

    // Blue utility shed moved southwards along the road adjacent to sports courts per user annotation
    hostelGroup.add(makeBox(7.2, 3.2, 8.5, mats.whiteColumn, 10.8, 1.6, -8.5, true, true));
    hostelGroup.add(makeBox(7.6, 0.25, 8.9, mats.shedBlue, 10.8, 3.3, -8.5, true, true));
    hostelGroup.add(makeBox(3.4, 2.8, 4.8, mats.whiteColumn, 8.2, 1.4, 0, true, true));
    hostelGroup.add(makeBox(3.7, 0.22, 5.1, mats.shedBlue, 8.2, 2.9, 0, true, true));

    registerBuilding('hostels', hostelGroup);
    scene.add(hostelGroup);

    // 7. SPORTS AREA & GROUND IN FRONT OF HOSTELS
    const sportsGroup = new THREE.Group();
    sportsGroup.position.set(-23, 0.14, 2);

    const courtComplex = new THREE.Group();
    courtComplex.position.set(-11.2, 0, -5.5);

    const ccW = 9.2;
    const ccD = 33.0;

    courtComplex.add(makeBox(ccW, 0.08, ccD, new THREE.MeshStandardMaterial({ color: '#38BDF8', roughness: 0.68 }), 0, 0.04, 0, false, true));

    // North Court: Basketball Court
    const bballZ = -10.5;
    courtComplex.add(makeBox(7.4, 0.1, 10.6, new THREE.MeshStandardMaterial({ color: '#1D4ED8', roughness: 0.65 }), 0, 0.05, bballZ, false, true));
    courtComplex.add(makeBox(7.4, 0.11, 0.09, mats.whiteLine, 0, 0.055, bballZ, false, false));
    courtComplex.add(makeBox(7.4, 0.11, 0.09, mats.whiteLine, 0, 0.055, bballZ + 5.25, false, false));
    courtComplex.add(makeBox(7.4, 0.11, 0.09, mats.whiteLine, 0, 0.055, bballZ - 5.25, false, false));
    courtComplex.add(makeBox(0.09, 0.11, 10.6, mats.whiteLine, 3.65, 0.055, bballZ, false, false));
    courtComplex.add(makeBox(0.09, 0.11, 10.6, mats.whiteLine, -3.65, 0.055, bballZ, false, false));

    const bRing = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.85, 24), mats.whiteLine);
    bRing.rotation.x = -Math.PI / 2;
    bRing.position.set(0, 0.115, bballZ);
    courtComplex.add(bRing);

    [-1, 1].forEach((dir) => {
      const bz = bballZ + dir * 5.45;
      courtComplex.add(makeBox(0.16, 2.25, 0.16, mats.metalDark, 0, 1.125, bz, true, false));
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(1.25, 0.78, 0.06),
        new THREE.MeshPhysicalMaterial({ color: '#E0F2FE', transparent: true, opacity: 0.78, roughness: 0.1 })
      );
      board.position.set(0, 2.1, bz - dir * 0.55);
      courtComplex.add(board);
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.2, 0.03, 8, 16),
        new THREE.MeshStandardMaterial({ color: '#EA580C', roughness: 0.4 })
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.set(0, 1.88, bz - dir * 0.78);
      courtComplex.add(rim);
    });

    // Middle Twin Tennis Courts
    [-0.8, 6.6].forEach((tz) => {
      courtComplex.add(makeBox(7.4, 0.1, 6.2, new THREE.MeshStandardMaterial({ color: '#2563EB', roughness: 0.65 }), 0, 0.05, tz, false, true));
      courtComplex.add(makeBox(7.4, 0.11, 0.08, mats.whiteLine, 0, 0.055, tz + 3.05, false, false));
      courtComplex.add(makeBox(7.4, 0.11, 0.08, mats.whiteLine, 0, 0.055, tz - 3.05, false, false));
      courtComplex.add(makeBox(0.08, 0.11, 6.2, mats.whiteLine, 3.65, 0.055, tz, false, false));
      courtComplex.add(makeBox(0.08, 0.11, 6.2, mats.whiteLine, -3.65, 0.055, tz, false, false));
      courtComplex.add(makeBox(7.6, 0.55, 0.05, mats.whiteLine, 0, 0.32, tz, false, false));
    });

    // South Badminton Court
    const badZ = 13.2;
    courtComplex.add(makeBox(6.8, 0.1, 4.8, new THREE.MeshStandardMaterial({ color: '#1D4ED8', roughness: 0.65 }), 0, 0.05, badZ, false, true));
    courtComplex.add(makeBox(6.8, 0.11, 0.08, mats.whiteLine, 0, 0.055, badZ + 2.35, false, false));
    courtComplex.add(makeBox(6.8, 0.11, 0.08, mats.whiteLine, 0, 0.055, badZ - 2.35, false, false));
    courtComplex.add(makeBox(0.08, 0.11, 4.8, mats.whiteLine, 3.35, 0.055, badZ, false, false));
    courtComplex.add(makeBox(0.08, 0.11, 4.8, mats.whiteLine, -3.35, 0.055, badZ, false, false));
    courtComplex.add(makeBox(6.8, 0.72, 0.05, mats.whiteLine, 0, 0.4, badZ, false, false));

    for (let fz = -ccD / 2; fz <= ccD / 2; fz += 3.3) {
      courtComplex.add(makeBox(0.1, 2.6, 0.1, mats.fenceGreen, -ccW / 2, 1.3, fz, false, false));
      courtComplex.add(makeBox(0.1, 2.6, 0.1, mats.fenceGreen, ccW / 2, 1.3, fz, false, false));
    }
    courtComplex.add(makeBox(0.06, 0.08, ccD, mats.fenceGreen, -ccW / 2, 2.55, 0, false, false));
    courtComplex.add(makeBox(0.06, 0.08, ccD, mats.fenceGreen, ccW / 2, 2.55, 0, false, false));
    courtComplex.add(makeBox(ccW, 0.08, 0.06, mats.fenceGreen, 0, 2.55, -ccD / 2, false, false));
    courtComplex.add(makeBox(ccW, 0.08, 0.06, mats.fenceGreen, 0, 2.55, ccD / 2, false, false));

    sportsGroup.add(courtComplex);

    // Football Ground & 4-Lane Terracotta Athletics Track
    const fieldGroup = new THREE.Group();
    fieldGroup.position.set(4.5, 0, 4.5);

    const trackOuterW = 19.6;
    const trackOuterD = 31.0;
    const trackLaneW = 2.1;

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
          ctx.fillStyle = i % 2 === 0 ? '#2E6F32' : '#387D3C';
          ctx.fillRect(0, i * sh, w, sh);
        }
        ctx.strokeStyle = '#FACC15';
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
        new THREE.MeshStandardMaterial({ color: '#F8FAFC', transparent: true, opacity: 0.38 })
      );
      net.position.set(0, gh / 2 + 0.08, gz + dir * 0.45);
      fieldGroup.add(net);
    });

    for (let fz = -trackOuterD / 2; fz <= trackOuterD / 2; fz += 3.1) {
      fieldGroup.add(makeBox(0.1, 2.8, 0.1, mats.fenceGreen, -trackOuterW / 2 - 0.3, 1.4, fz, false, false));
      fieldGroup.add(makeBox(0.1, 2.8, 0.1, mats.fenceGreen, trackOuterW / 2 + 0.3, 1.4, fz, false, false));
    }
    for (let fx = -trackOuterW / 2; fx <= trackOuterW / 2; fx += 3.2) {
      fieldGroup.add(makeBox(0.1, 2.8, 0.1, mats.fenceGreen, fx, 1.4, -trackOuterD / 2 - 0.3, false, false));
      fieldGroup.add(makeBox(0.1, 2.8, 0.1, mats.fenceGreen, fx, 1.4, trackOuterD / 2 + 0.3, false, false));
    }
    fieldGroup.add(makeBox(0.06, 0.08, trackOuterD + 0.6, mats.fenceGreen, -trackOuterW / 2 - 0.3, 2.75, 0, false, false));
    fieldGroup.add(makeBox(0.06, 0.08, trackOuterD + 0.6, mats.fenceGreen, trackOuterW / 2 + 0.3, 2.75, 0, false, false));
    fieldGroup.add(makeBox(trackOuterW + 0.6, 0.08, 0.06, mats.fenceGreen, 0, 2.75, -trackOuterD / 2 - 0.3, false, false));
    fieldGroup.add(makeBox(trackOuterW + 0.6, 0.08, 0.06, mats.fenceGreen, 0, 2.75, trackOuterD / 2 + 0.3, false, false));

    sportsGroup.add(fieldGroup);

    [
      [-15.5, -21.5],
      [14.2, -11.5],
      [-15.5, 19.5],
      [14.2, 20.5]
    ].forEach(([mx, mz]) => {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 8.6, 10), mats.metalSilver);
      mast.position.set(mx, 4.3, mz);
      mast.castShadow = true;
      sportsGroup.add(mast);
      const bank = makeBox(1.4, 0.55, 0.25, mats.metalDark, mx, 8.65, mz, true, false);
      bank.lookAt(0, 1, 0);
      sportsGroup.add(bank);
    });

    registerBuilding('sports', sportsGroup);
    scene.add(sportsGroup);

    // 8. MAIN ENTRANCE
    const entranceGroup = new THREE.Group();

    const roadCenterX = 15;
    const roadStartZ = 25.5;
    const roadEndZ = 47.6;
    const roadLen = roadEndZ - roadStartZ;
    const roadMidZ = (roadStartZ + roadEndZ) / 2;

    entranceGroup.add(makeBox(4.3, 0.14, roadLen, mats.asphalt, roadCenterX - 3.1, 0.07, roadMidZ, false, true));
    entranceGroup.add(makeBox(4.3, 0.14, roadLen, mats.asphalt, roadCenterX + 3.1, 0.07, roadMidZ, false, true));

    const apron = new THREE.Mesh(new THREE.CylinderGeometry(6.6, 6.6, 0.15, 32), mats.asphalt);
    apron.position.set(roadCenterX, 0.075, 26.2);
    apron.receiveShadow = true;
    entranceGroup.add(apron);

    for (let dz = roadStartZ + 1.5; dz < roadEndZ - 1; dz += 2.6) {
      entranceGroup.add(makeBox(0.12, 0.15, 1.1, mats.whiteLine, roadCenterX - 3.1, 0.075, dz, false, false));
      entranceGroup.add(makeBox(0.12, 0.15, 1.1, mats.whiteLine, roadCenterX + 3.1, 0.075, dz, false, false));
    }

    const gateZ = 34.8;
    const canopyGroup = new THREE.Group();
    canopyGroup.position.set(roadCenterX, 0.14, gateZ);

    const canopySpanW = 10.8;
    const canopyDepthD = 7.0;
    const eaveH = 4.45;
    const ridgeH = 1.95;

    [-canopySpanW / 2 + 0.45, 0, canopySpanW / 2 - 0.45].forEach((px) => {
      [-canopyDepthD / 2 + 0.55, canopyDepthD / 2 - 0.55].forEach((pz) => {
        canopyGroup.add(makeBox(0.62, 0.5, 0.62, mats.granite, px, 0.25, pz, true, true));
        canopyGroup.add(makeBox(0.46, eaveH - 0.5, 0.46, mats.whiteColumn, px, 0.5 + (eaveH - 0.5) / 2, pz, true, true));
      });
    });

    canopyGroup.add(makeBox(1.55, 2.55, 4.8, mats.whiteColumn, 0, 1.275, 0, true, true));
    canopyGroup.add(makeBox(1.62, 1.05, 3.8, mats.glassClassical, 0, 1.72, 0, false, false));

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

    [-6.6, 6.6].forEach((wx) => {
      canopyGroup.add(makeBox(1.4, 4.8, 1.5, mats.terracotta, wx, 2.4, 0, true, true));
      canopyGroup.add(makeBox(1.65, 0.3, 1.75, mats.sandstoneTrim, wx, 4.9, 0, true, true));
    });

    [-2.8, 2.8].forEach((bx) => {
      canopyGroup.add(makeBox(0.26, 0.95, 0.26, mats.terracotta, bx, 0.475, 2.5, true, true));
      canopyGroup.add(makeBox(2.2, 0.08, 0.08, mats.whiteLine, bx * 0.55, 0.88, 2.5, false, false));
    });

    entranceGroup.add(canopyGroup);

    const medianLen = 8.4;
    const medianZ = 42.8;
    entranceGroup.add(makeBox(1.5, 0.34, medianLen, mats.sandstoneTrim, roadCenterX, 0.17, medianZ, true, true));
    entranceGroup.add(makeBox(1.1, 0.38, medianLen - 0.4, mats.lawnDark, roadCenterX, 0.19, medianZ, false, true));

    [-3.0, -1.6, 1.6, 3.0].forEach((tz) => {
      const shrub = new THREE.Mesh(new THREE.SphereGeometry(0.52, 12, 10), mats.treeFoliage1);
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

    entranceGroup.add(makeBox(21.5, 0.16, 15.5, mats.paver, -2.4, 0.08, 36.2, false, true));
    entranceGroup.add(makeBox(25.5, 0.16, 15.5, mats.paver, 36.2, 0.08, 36.2, false, true));

    for (let sx = -11.5; sx <= 6.5; sx += 2.2) {
      entranceGroup.add(makeBox(0.08, 0.17, 3.6, mats.whiteLine, sx, 0.085, 31.2, false, false));
      entranceGroup.add(makeBox(0.08, 0.17, 3.6, mats.whiteLine, sx, 0.085, 41.2, false, false));
    }
    for (let sx = 24.5; sx <= 40.5; sx += 2.2) {
      entranceGroup.add(makeBox(0.08, 0.17, 3.6, mats.whiteLine, sx, 0.085, 31.2, false, false));
      entranceGroup.add(makeBox(0.08, 0.17, 3.6, mats.whiteLine, sx, 0.085, 41.2, false, false));
    }

    const bikeShelter = new THREE.Group();
    bikeShelter.position.set(45.2, 0.16, 39.2);
    const shelterRoof = makeBox(4.2, 0.14, 7.2, mats.terracotta, 0, 2.15, 0, true, true);
    shelterRoof.rotation.z = -0.08;
    bikeShelter.add(shelterRoof);
    [-1.7, 1.7].forEach((px) => {
      [-3.0, 0, 3.0].forEach((pz) => {
        bikeShelter.add(makeBox(0.14, 2.15, 0.14, mats.metalDark, px, 1.075, pz, true, false));
      });
    });
    for (let bz = -2.6; bz <= 2.6; bz += 0.92) {
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

    // 9. DETAILED VEHICLES (Yellow KRMU Buses in D Block Ground + Cars & Bikes)
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

    const krmuBusSideTex = createCanvasTexture((ctx, w, h) => {
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#1E3A8A';
      ctx.fillRect(0, Math.floor(h * 0.35), w, Math.floor(h * 0.45));

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('K.R. MANGALAM UNIVERSITY', w / 2, h * 0.58);
    }, 512, 128);

    const busSideMat = new THREE.MeshStandardMaterial({
      map: krmuBusSideTex,
      roughness: 0.38,
      metalness: 0.2,
    });

    const createKrmuBus = () => {
      const bus = new THREE.Group();
      const bw = 1.55;
      const bh = 1.85;
      const bl = 5.1;

      bus.add(makeBox(bw, bh, bl, mats.busYellow, 0, 0.36 + bh / 2, 0, true, true));
      bus.add(makeBox(bw - 0.1, 0.12, bl - 0.2, mats.whiteColumn, 0, 0.36 + bh + 0.06, 0, false, false));
      bus.add(makeBox(0.9, 0.16, 1.2, mats.metalSilver, 0, 0.36 + bh + 0.16, 0.4, false, false));
      bus.add(makeBox(bw + 0.04, 0.65, bl - 0.45, mats.glassTintMat, 0, 0.36 + bh * 0.64, -0.1, false, false));
      bus.add(makeBox(bw + 0.05, 0.2, bl - 0.2, mats.busStripe, 0, 0.36 + bh * 0.36, 0, false, false));
      bus.add(makeBox(bw - 0.16, 0.82, 0.08, mats.glassTintMat, 0, 0.36 + bh * 0.62, bl / 2 + 0.01, false, false));

      // K.R. Mangalam University branding on both sides of bus
      const busSignLeft = new THREE.Mesh(new THREE.PlaneGeometry(bl - 0.8, 0.42), busSideMat);
      busSignLeft.position.set(-bw / 2 - 0.03, 1.05, 0);
      busSignLeft.rotation.y = -Math.PI / 2;
      bus.add(busSignLeft);

      const busSignRight = new THREE.Mesh(new THREE.PlaneGeometry(bl - 0.8, 0.42), busSideMat);
      busSignRight.position.set(bw / 2 + 0.03, 1.05, 0);
      busSignRight.rotation.y = Math.PI / 2;
      bus.add(busSignRight);

      [
        [-0.78, 0.35, 1.65],
        [0.78, 0.35, 1.65],
        [-0.78, 0.35, -1.55],
        [0.78, 0.35, -1.55]
      ].forEach(([wx, wy, wz]) => {
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.22, 16), mats.tireMat);
        tire.rotation.z = Math.PI / 2;
        tire.position.set(wx, wy, wz);
        tire.castShadow = true;
        bus.add(tire);
      });
      return bus;
    };

    for (let i = 0; i < 9; i++) {
      const southRowBus = createKrmuBus();
      southRowBus.position.set(3.2 + i * 2.8, 0.15, -12.6);
      southRowBus.rotation.y = 0.42;
      vehiclesGroup.add(southRowBus);
    }
    for (let i = 0; i < 4; i++) {
      const eastRowBus = createKrmuBus();
      eastRowBus.position.set(27.2, 0.15, -22.2 + i * 2.6);
      eastRowBus.rotation.y = Math.PI / 2 - 0.25;
      vehiclesGroup.add(eastRowBus);
    }
    [
      [-10.4, 31.2, 0, 0, false],
      [-6.0, 31.2, 0, 1, true],
      [-1.6, 31.2, 0, 2, false],
      [2.8, 31.2, 0, 3, true],
      [-8.2, 41.2, Math.PI, 4, false],
      [-3.8, 41.2, Math.PI, 5, true],
      [0.6, 41.2, Math.PI, 6, false],
      [5.0, 41.2, Math.PI, 0, false]
    ].forEach(([x, z, rot, cIdx, suv]) => {
      const car = createDetailedCar(carBodyColors[cIdx as number], suv as boolean);
      car.position.set(x as number, 0.16, z as number);
      car.rotation.y = rot as number;
      vehiclesGroup.add(car);
    });

    [
      [25.6, 31.2, 0, 1, true],
      [30.0, 31.2, 0, 0, false],
      [34.4, 31.2, 0, 6, true],
      [38.8, 31.2, 0, 3, false],
      [27.8, 41.2, Math.PI, 2, false],
      [32.2, 41.2, Math.PI, 4, true],
      [36.6, 41.2, Math.PI, 5, false]
    ].forEach(([x, z, rot, cIdx, suv]) => {
      const car = createDetailedCar(carBodyColors[cIdx as number], suv as boolean);
      car.position.set(x as number, 0.16, z as number);
      car.rotation.y = rot as number;
      vehiclesGroup.add(car);
    });

    const twoWheelerColors = ['#0F766E', '#DC2626', '#1E293B', '#F8FAFC', '#2563EB', '#D97706'];
    for (let i = 0; i < 10; i++) {
      const tw = createTwoWheeler(twoWheelerColors[i % twoWheelerColors.length], i % 2 === 1);
      tw.position.set(42.2 + (i % 5) * 1.15, 0.16, i < 5 ? 30.2 : 32.8);
      tw.rotation.y = i < 5 ? 0 : Math.PI;
      vehiclesGroup.add(tw);
    }

    scene.add(vehiclesGroup);

    // 10. LANDSCAPE TREES & AVENUE PLANTING INSIDE PLINTH
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

    for (let tz = 27; tz <= 44; tz += 4.5) {
      if (Math.abs(tz - gateZ) < 3.4) continue;
      addTree(9.1, tz, 0.9, 0);
      addTree(20.9, tz, 0.9, 1);
    }

    [
      [-55, 38, 1.1, 0],
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
      [31, -42, 1.05, 1],
      [-3, -42, 1.05, 0],
      [-9.5, -17.5, 1.35, 0],
      [-26, -34, 1.15, 1],
      [-56, -38, 1.1, 1],
      [-56, -14, 1.0, 0],
      [-56, 12, 1.05, 1]
    ].forEach(([x, z, s, v]) => addTree(x, z, s, v));

    scene.add(landscapeGroup);
    scene.add(roofDetailsGroup);

    // 11. RAYCASTING FOR CLICK & HOVER INTERACTIVITY
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

    // 12. RESIZE & ANIMATION LOOP
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

      const { flagMesh, flagBasePositions, camAnim, starsMesh } = animatedRefs.current;
      if (starsMesh && starsMesh.visible) {
        starsMesh.rotation.y = elapsed * 0.005;
      }
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

      {/* Slide-Over Building Inspector Drawer */}
      <aside
        className={`absolute top-4 right-4 bottom-4 w-88 max-w-[calc(100vw-2rem)] z-30 bg-white border border-[#CBD5E1] rounded-lg shadow-lg flex flex-col transition-transform duration-200 ease-out font-sans ${
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
