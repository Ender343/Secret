// Usamos módulos ES desde CDN
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { FontLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://unpkg.com/three@0.160.0/examples/jsm/geometries/TextGeometry.js";

const container = document.getElementById("scene");

// Escena
const scene = new THREE.Scene();

// Cámara
const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 85);

// Render
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Grupo principal para rotar todo junto
const group = new THREE.Group();
scene.add(group);

// ---------- Corazón 3D en malla (extrusión de una curva 2D) ----------
function createHeartWireframe() {
  // Curva paramétrica del corazón (2D)
  const pts = [];
  const STEPS = 500; // más pasos -> más suave
  for (let i = 0; i <= STEPS; i++) {
    const t = (i / STEPS) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    pts.push(new THREE.Vector2(x, y));
  }

  const shape = new THREE.Shape(pts);

  const extrude = new THREE.ExtrudeGeometry(shape, {
    depth: 10,             // grosor “3D”
    steps: 2,
    bevelEnabled: true,
    bevelSegments: 8,
    bevelSize: 1.2,
    bevelThickness: 1.2,
    curveSegments: 300,    // densidad del mallado en el contorno
  });

  // Centrar y escalar a un tamaño cómodo
  extrude.center();
  const s = 1.3;
  extrude.scale(s, s, s);

  const mat = new THREE.MeshBasicMaterial({
    color: 0xff6aa6,   // rosa suave
    wireframe: true,   // apariencia de malla/vector
  });

  const mesh = new THREE.Mesh(extrude, mat);
  // Un poquito inclinado para “volumen”
  mesh.rotation.x = THREE.MathUtils.degToRad(12);
  return mesh;
}

const heartMesh = createHeartWireframe();
group.add(heartMesh);

// ---------- Texto "TE AMO" en medio ----------
const fontLoader = new FontLoader();
fontLoader.load(
  "https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json",
  (font) => {
    const textGeo = new TextGeometry("TE AMO", {
      font,
      size: 10,
      height: 2.2,
      curveSegments: 8,
      bevelEnabled: false,
    });
    textGeo.center(); // centramos el texto en su propio bounding box

    const textMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, // blanco
      wireframe: true, // también en malla para mantener el estilo
    });

    const textMesh = new THREE.Mesh(textGeo, textMat);
    // Ligeramente al frente para que no se pierda dentro del corazón
    textMesh.position.z = 1.5;
    group.add(textMesh);
  }
);

// Luz opcional (no afecta MeshBasicMaterial, pero si cambias a MeshLambert lo tendrás listo)
// const light = new THREE.AmbientLight(0xffffff, 0.6);
// scene.add(light);

// Animación
let t = 0;
function animate() {
  requestAnimationFrame(animate);
  t += 0.01;
  group.rotation.y = t;         // giro suave
  group.rotation.x = Math.sin(t * 0.35) * 0.2; // leve bamboleo
  renderer.render(scene, camera);
}
animate();

// Responsivo
window.addEventListener("resize", onResize);
function onResize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
