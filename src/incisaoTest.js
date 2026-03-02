import * as THREE from 'three';
import { FBXLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// =============================
// 🎬 CENA
// =============================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    100
);
camera.position.set(0, 1, 2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;


// =============================
// 💡 LUZ
// =============================
scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
scene.add(dirLight);


// =============================
// 🔪 VARIÁVEIS
// =============================
let isCutting = false;
let bisturiModelo = null;
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const loader = new FBXLoader();


// =============================
// 🔪 CARREGAR BISTURI
// =============================
// loader.load('modelos/outros/ferramentas/scaple-v3.fbx', (fbx) => {

//     fbx.scale.setScalar(0.01);
//     bisturiModelo = fbx;
//     bisturiModelo.visible = false;

//     scene.add(bisturiModelo);
// });


// =============================
// 🧍 CARREGAR MODELO DE INCISÃO
// =============================
loader.load('../modelos/outros/ferramentas/incisao.fbx', (fbx) => {

    fbx.scale.setScalar(1);
    fbx.position.set(0, 0, 0);

    fbx.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.userData.cortavel = true;
        }
    });

    scene.add(fbx);
});


// =============================
// 🖱️ EVENTOS
// =============================
window.addEventListener('pointerdown', () => isCutting = true);
window.addEventListener('pointerup', () => isCutting = false);

window.addEventListener('pointermove', (event) => {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    const hit = intersects.find(i => i.object.userData.cortavel);

    if (hit && bisturiModelo) {

        bisturiModelo.visible = true;
        bisturiModelo.position.copy(hit.point);
        bisturiModelo.position.y += 0.005;

        if (isCutting) {
            criarLinhaDeSangue(hit.point);
        }

    } else if (bisturiModelo) {
        bisturiModelo.visible = false;
    }
});


// =============================
// 🩸 SANGUE
// =============================
function criarLinhaDeSangue(posicao) {

    const pontoGeom = new THREE.SphereGeometry(0.005, 6, 6);
    const pontoMat = new THREE.MeshBasicMaterial({ color: 0x990000 });
    const sangue = new THREE.Mesh(pontoGeom, pontoMat);

    sangue.position.copy(posicao);
    sangue.position.y += 0.001;

    scene.add(sangue);
}


// =============================
// 🎬 LOOP
// =============================
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();