// main.js — Corazón 3D (Bézier exacto) + texto
import * as THREE from "https://esm.sh/three@0.160.0";
import { FontLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://esm.sh/three@0.160.0/examples/jsm/geometries/TextGeometry.js";

const container = document.getElementById("scene");

// ---------- Escena / cámara / renderer ----------
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 85);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Grupo para rotar todo junto
const group = new THREE.Group();
scene.add(group);

// ---------- Corazón con las curvas Bézier de la figura ----------
function createHeartMesh({ wireframe = true, color = 0xff6aa6 } = {}) {
  const x = 0, y = 0;
  const s = 1; // escala base del shape (lo centraremos y escalaremos luego)

  const heartShape = new THREE.Shape();
  // Punto inicial:
  heartShape.moveTo(x + 25, y + 25);

  // Mismas 6 curvas Bézier que viste en GeoGebra:






  heartShape.bezierCurveTo(x + 25, y + 25, x + 20, y + 0,  x + 0,  y + 0);
  heartShape.bezierCurveTo(x - 30, y + 0,  x - 30, y + 35, x - 30, y + 35);
  heartShape.bezierCurveTo(x - 30, y + 55, x - 10, y + 77, x + 25, y + 95);
  heartShape.bezierCurveTo(x + 60, y + 77, x + 80, y + 55, x + 80, y + 35);
  heartShape.bezierCurveTo(x + 80, y + 35, x + 80, y + 0,  x + 50, y + 0);
  heartShape.bezierCurveTo(x + 35, y + 0,  x + 25, y + 25, x + 25, y + 25);

  // Extrusión para darle grosor 3D
  const geom = new THREE.ExtrudeGeometry(heartShape, {
    depth: 10,           // grosor
    steps: 1,
    bevelEnabled: true,
    bevelSegments: 6,
    bevelSize: 2,
    bevelThickness: 2,
    curveSegments: 64,
  });

  // Centrar y escalar a tamaño cómodo
  geom.center();
  geom.scale(0.25 * s, 0.25 * s, 0.25 * s);

  // --------- Opciones de “malla”: wireframe o aristas limpias ---------
  const USE_EDGES = false; // pon true para líneas limpias (sin diagonales internas)

  if (USE_EDGES) {
    const edges = new THREE.EdgesGeometry(geom, 12);
    const lineMat = new THREE.LineBasicMaterial({ color });
    const lines = new THREE.LineSegments(edges, lineMat);
    lines.rotation.x = THREE.MathUtils.degToRad(12);
    return lines;
  } else {
    const mat = new THREE.MeshBasicMaterial({ color, wireframe });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.rotation.x = THREE.MathUtils.degToRad(12);
    mesh.rotation.x = THREE.MathUtils.degToRad(180);

    return mesh;
  }
}

const heart = createHeartMesh();
group.add(heart);

// ---------- Texto “TE AMO” y “FÁTIMA” ----------
new FontLoader().load(
  "https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json",
  (font) => {
    // Texto superior: TE AMO
    const geo1 = new TextGeometry("TE AMO", {
      font,
      size: 10,
      height: 2,
      curveSegments: 32,
      bevelEnabled: true,
      bevelSize: 0.3,
      bevelThickness: 0.3,
      bevelSegments: 5,
    });
    geo1.center();
    const mat1 = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const text1 = new THREE.Mesh(geo1, mat1);
    text1.position.z = 1.5;
    text1.rotation.y = Math.PI;
    group.add(text1);

    // Texto inferior: FÁTIMA
    const geo2 = new TextGeometry("FATIMA", {
      font,
      size: 6,     // un poco más pequeño
      height: 2,
      curveSegments: 32,
      bevelEnabled: true,
      bevelSize: 0.25,
      bevelThickness: 0.25,
      bevelSegments: 4,
    });
    geo2.center();
    const mat2 = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }); // azul claro para contraste
    const text2 = new THREE.Mesh(geo2, mat2);
    text2.position.z = 1.5;
    text2.position.y = -12; // bajarlo debajo del TE AMO
    text2.rotation.y = Math.PI;
    group.add(text2);
  },
  undefined,
  (err) => console.error("No cargó la fuente:", err)
);

// ---------- Animación (con latido suave) ----------
let t = 0;
function animate() {
  requestAnimationFrame(animate);
  t += 0.01;

  // Latido sutil
  const s = 1 + Math.sin(t * 2) * 0.03;
  group.scale.set(s, s, s);

  // Giro
  group.rotation.y += 0.01;

  renderer.render(scene, camera);
}
animate();

// ---------- Resize ----------
window.addEventListener("resize", () => {
  const w = container.clientWidth, h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});
