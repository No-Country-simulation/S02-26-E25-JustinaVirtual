// import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
// import { FBXLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/FBXLoader.js';
// import { TransformControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/TransformControls.js';
// import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';


// // =============================
// // 🎮 BOTÕES NO TOPO
// // =============================
// const topMenu = document.createElement("div");

// topMenu.style.position = "absolute";
// topMenu.style.top = "10px";
// topMenu.style.left = "50%";
// topMenu.style.transform = "translateX(-50%)";
// topMenu.style.display = "flex";
// topMenu.style.gap = "20px";
// topMenu.style.zIndex = "10";

// document.body.appendChild(topMenu);

// const btnSutura = document.createElement("button");
// btnSutura.innerText = "🪡 Teste de Sutura";
// btnSutura.style.padding = "10px 20px";
// btnSutura.style.fontSize = "16px";

// const btnCirurgia = document.createElement("button");
// btnCirurgia.innerText = "🔪 Teste de Cirurgia";
// btnCirurgia.style.padding = "10px 20px";
// btnCirurgia.style.fontSize = "16px";

// topMenu.appendChild(btnSutura);
// topMenu.appendChild(btnCirurgia);

// btnSutura.onclick = () => {
//     console.log("Teste de sutura iniciado");
// };

// btnCirurgia.onclick = () => {
//     console.log("Teste de cirurgia iniciado");
// };


// // =============================
// // 1️⃣ CENA E CÂMERA
// // =============================
// const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x222222);

// const camera = new THREE.PerspectiveCamera(
//     60,
//     window.innerWidth / window.innerHeight,
//     0.01,
//     1000
// );

// camera.position.set(2, 2, 3);


// // =============================
// // 2️⃣ RENDERER
// // =============================
// const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// renderer.outputColorSpace = THREE.SRGBColorSpace;
// renderer.shadowMap.enabled = true;

// document.body.appendChild(renderer.domElement);


// // =============================
// // 🎮 3️⃣ ORBIT CONTROLS
// // =============================
// const controls = new OrbitControls(camera, renderer.domElement);

// controls.enableDamping = true;
// controls.dampingFactor = 0.05;
// controls.rotateSpeed = 0.5;
// controls.zoomSpeed = 0.12;
// controls.panSpeed = 0.3;
// controls.minDistance = 1.5;
// controls.maxDistance = 10;
// controls.maxPolarAngle = Math.PI / 2;
// controls.target.set(0, 1, 0);
// controls.update();


// // =============================
// // 4️⃣ TRANSFORM CONTROLS
// // =============================
// const transformControls = new TransformControls(camera, renderer.domElement);
// scene.add(transformControls);

// transformControls.addEventListener('dragging-changed', function (event) {
//     controls.enabled = !event.value;
// });

// let selecionando = false;
// let objetoSelecionado = null;
// const meshesParaRaycaster = [];


// // =============================
// // 5️⃣ UI
// // =============================
// const uiContainer = document.createElement('div');
// uiContainer.style.position = 'absolute';
// uiContainer.style.top = '60px';
// uiContainer.style.left = '20px';
// uiContainer.style.color = 'white';
// uiContainer.style.whiteSpace = 'pre';
// document.body.appendChild(uiContainer);

// const btnCancel = document.createElement('button');
// btnCancel.innerHTML = "🚫 Cancelar Seleção (Esc)";
// btnCancel.style.padding = '10px';
// uiContainer.appendChild(btnCancel);

// const selectedName = document.createElement('div');
// selectedName.style.marginTop = '5px';
// selectedName.innerText = "Nenhum selecionado";
// uiContainer.appendChild(selectedName);

// btnCancel.onclick = () => {
//     transformControls.detach();
//     objetoSelecionado = null;
//     selectedName.innerText = "Nenhum selecionado";
// };


// // =============================
// // 6️⃣ ATALHOS
// // =============================
// window.addEventListener('keydown', (e) => {
//     if (e.key === 'e') selecionando = !selecionando;
//     if (e.key === 'r') transformControls.setMode('rotate');
//     if (e.key === 't') transformControls.setMode('translate');
//     if (e.key === 's') transformControls.setMode('scale');
//     if (e.key === 'Escape') {
//         transformControls.detach();
//         objetoSelecionado = null;
//         selectedName.innerText = "Nenhum selecionado";
//     }
// });


// // =============================
// // 7️⃣ RAYCASTER
// // =============================
// const raycaster = new THREE.Raycaster();
// const mouse = new THREE.Vector2();

// window.addEventListener('pointerdown', (event) => {

//     if (!selecionando) return;

//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//     raycaster.setFromCamera(mouse, camera);

//     const intersects = raycaster.intersectObjects(meshesParaRaycaster, true);

//     if (intersects.length > 0) {

//         let mesh = intersects[0].object;
//         const rootGroup = mesh.userData.rootGroup;

//         objetoSelecionado = rootGroup;
//         transformControls.attach(objetoSelecionado);
//         selectedName.innerText = objetoSelecionado.name;
//     }
// });


// // =============================
// // 8️⃣ LUZES
// // =============================
// scene.add(new THREE.AmbientLight(0xffffff, 1.5));

// const dirLight = new THREE.DirectionalLight(0xffffff, 2);
// dirLight.position.set(5, 10, 7);
// dirLight.castShadow = true;
// scene.add(dirLight);


// // =============================
// // 9️⃣ CARREGAMENTO DE MODELOS
// // =============================
// const loader = new FBXLoader();

// function carregarModelo(caminho, escala, posicao, rotacao = null) {

//     loader.load(caminho, (model) => {

//         model.scale.setScalar(escala);
//         model.name = caminho.split('/').pop();

//         model.traverse((child) => {

//             if (child.isMesh) {

//                 child.castShadow = true;
//                 child.receiveShadow = true;

//                 child.userData.rootGroup = model;
//                 meshesParaRaycaster.push(child);

//                 if (model.name.includes('Regions of human body')) {

//                     const nome = child.name.toLowerCase();

//                     if (nome.includes('hair') || nome.includes('cabelo')) {

//                         child.material = new THREE.MeshStandardMaterial({
//                             color: 0x111111,
//                             roughness: 0.9
//                         });

//                     } else {

//                         child.material = new THREE.MeshStandardMaterial({
//                             color: 0xFFDBAC,
//                             roughness: 0.6,
//                             metalness: 0.0
//                         });
//                     }
//                 }
//             }
//         });

//         const box = new THREE.Box3().setFromObject(model);
//         model.position.y -= box.min.y;
//         model.position.add(posicao);

//         if (rotacao) {
//             model.rotation.set(rotacao.x, rotacao.y, rotacao.z);
//         }

//         scene.add(model);
//     });
// }


// // =============================
// // 🔟 GRID
// // =============================
// scene.add(new THREE.GridHelper(10, 10));


// // =============================
// // 1️⃣1️⃣ MODELOS
// // =============================
// carregarModelo(
//     'modelos/outros/Regions of human body100 (1).fbx',
//     0.015,
//     new THREE.Vector3(-1.5, 1.738, 0.559),
//     new THREE.Vector3(-1.571, 0, -1.432)
// );

// carregarModelo('modelos/outros/maca.fbx', 0.015, new THREE.Vector3(0.5, 0, -1.4));
// carregarModelo('modelos/outros/SistemaMuscular100.fbx', 0.01, new THREE.Vector3(0, 0, 0));
// carregarModelo('modelos/OP_Mitte.fbx', 0.01, new THREE.Vector3(0, -5, 0));
// carregarModelo(
//     'modelos/outros/lencol2.fbx',
//     0.01,
//     new THREE.Vector3(0.67, -0.7, -0.80),
//     new THREE.Vector3(THREE.MathUtils.degToRad(-80.3), 0, 0));


// // =============================
// // LOOP
// // =============================
// function animate() {
//     requestAnimationFrame(animate);
//     controls.update();
//     renderer.render(scene, camera);
// }

// window.addEventListener('resize', () => {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// });

// animate();

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { FBXLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/FBXLoader.js';
import { TransformControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/TransformControls.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';


// =============================
// 🎮 BOTÕES NO TOPO
// =============================
const topMenu = document.createElement("div");

topMenu.style.position = "absolute";
topMenu.style.top = "10px";
topMenu.style.left = "50%";
topMenu.style.transform = "translateX(-50%)";
topMenu.style.display = "flex";
topMenu.style.gap = "20px";
topMenu.style.zIndex = "10";

document.body.appendChild(topMenu);

// 🪡 Teste de Sutura
const btnSutura = document.createElement("button");
btnSutura.innerText = "🪡 Teste de Sutura";
btnSutura.style.padding = "10px 20px";
btnSutura.style.fontSize = "16px";
topMenu.appendChild(btnSutura);

btnSutura.onclick = () => {
    window.location.href = "suturaTest.html";
};

// ✂️ Teste de Incisão
const btnIncisao = document.createElement("button");
btnIncisao.innerText = "✂️ Teste de Incisão";
btnIncisao.style.padding = "10px 20px";
btnIncisao.style.fontSize = "16px";
topMenu.appendChild(btnIncisao);

btnIncisao.onclick = () => {
    window.location.href = "incisaoTest.html";
};

// 🔪 Teste de Cirurgia
const btnCirurgia = document.createElement("button");
btnCirurgia.innerText = "🔪 Teste de Cirurgia";
btnCirurgia.style.padding = "10px 20px";
btnCirurgia.style.fontSize = "16px";
topMenu.appendChild(btnCirurgia);

btnCirurgia.onclick = () => {
    window.location.href = "cirurgiaTest.html";
};


// =============================
// 1️⃣ CENA E CÂMERA
// =============================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
);

camera.position.set(2, 2, 3);


// =============================
// 2️⃣ RENDERER
// =============================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);


// =============================
// 🎮 3️⃣ ORBIT CONTROLS
// =============================
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;
controls.zoomSpeed = 0.12;
controls.panSpeed = 0.3;
controls.minDistance = 1.5;
controls.maxDistance = 10;
controls.maxPolarAngle = Math.PI / 2;
controls.target.set(0, 1, 0);
controls.update();


// =============================
// 4️⃣ TRANSFORM CONTROLS
// =============================
const transformControls = new TransformControls(camera, renderer.domElement);
scene.add(transformControls);

transformControls.addEventListener('dragging-changed', function (event) {
    controls.enabled = !event.value;
});

let selecionando = false;
let objetoSelecionado = null;
const meshesParaRaycaster = [];


// =============================
// 5️⃣ UI
// =============================
const uiContainer = document.createElement('div');
uiContainer.style.position = 'absolute';
uiContainer.style.top = '60px';
uiContainer.style.left = '20px';
uiContainer.style.color = 'white';
uiContainer.style.whiteSpace = 'pre';
document.body.appendChild(uiContainer);

const btnCancel = document.createElement('button');
btnCancel.innerHTML = "🚫 Cancelar Seleção (Esc)";
btnCancel.style.padding = '10px';
uiContainer.appendChild(btnCancel);

const selectedName = document.createElement('div');
selectedName.style.marginTop = '5px';
selectedName.innerText = "Nenhum selecionado";
uiContainer.appendChild(selectedName);

btnCancel.onclick = () => {
    transformControls.detach();
    objetoSelecionado = null;
    selectedName.innerText = "Nenhum selecionado";
};


// =============================
// 6️⃣ ATALHOS
// =============================
window.addEventListener('keydown', (e) => {
    if (e.key === 'e') selecionando = !selecionando;
    if (e.key === 'r') transformControls.setMode('rotate');
    if (e.key === 't') transformControls.setMode('translate');
    if (e.key === 's') transformControls.setMode('scale');
    if (e.key === 'Escape') {
        transformControls.detach();
        objetoSelecionado = null;
        selectedName.innerText = "Nenhum selecionado";
    }
});


// =============================
// 7️⃣ RAYCASTER
// =============================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', (event) => {

    if (!selecionando) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(meshesParaRaycaster, true);

    if (intersects.length > 0) {

        let mesh = intersects[0].object;
        const rootGroup = mesh.userData.rootGroup;

        objetoSelecionado = rootGroup;
        transformControls.attach(objetoSelecionado);
        selectedName.innerText = objetoSelecionado.name;
    }
});


// =============================
// 8️⃣ LUZES
// =============================
scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);


// =============================
// 9️⃣ CARREGAMENTO DE MODELOS
// =============================
const loader = new FBXLoader();

function carregarModelo(caminho, escala, posicao, rotacao = null) {

    loader.load(caminho, (model) => {

        model.scale.setScalar(escala);
        model.name = caminho.split('/').pop();

        model.traverse((child) => {

            if (child.isMesh) {

                child.castShadow = true;
                child.receiveShadow = true;

                child.userData.rootGroup = model;
                meshesParaRaycaster.push(child);

                if (model.name.includes('Regions of human body')) {

                    const nome = child.name.toLowerCase();

                    if (nome.includes('hair') || nome.includes('cabelo')) {

                        child.material = new THREE.MeshStandardMaterial({
                            color: 0x111111,
                            roughness: 0.9
                        });

                    } else {

                        child.material = new THREE.MeshStandardMaterial({
                            color: 0xFFDBAC,
                            roughness: 0.6,
                            metalness: 0.0
                        });
                    }
                }
            }
        });

        const box = new THREE.Box3().setFromObject(model);
        model.position.y -= box.min.y;
        model.position.add(posicao);

        if (rotacao) {
            model.rotation.set(rotacao.x, rotacao.y, rotacao.z);
        }

        scene.add(model);
    });
}


// =============================
// 🔟 GRID
// =============================
scene.add(new THREE.GridHelper(10, 10));


// =============================
// 1️⃣1️⃣ MODELOS
// =============================
carregarModelo(
    'modelos/outros/Regions of human body100 (1).fbx',
    0.015,
    new THREE.Vector3(-1.5, 1.738, 0.559),
    new THREE.Vector3(-1.571, 0, -1.432)
);

carregarModelo('modelos/outros/maca.fbx', 0.015, new THREE.Vector3(0.5, 0, -1.4));
carregarModelo('modelos/outros/SistemaMuscular100.fbx', 0.01, new THREE.Vector3(0, 0, 0));
carregarModelo('modelos/OP_Mitte.fbx', 0.01, new THREE.Vector3(0, -5, 0));
carregarModelo(
    'modelos/outros/lencol2.fbx',
    0.01,
    new THREE.Vector3(0.67, -0.7, -0.80),
    new THREE.Vector3(THREE.MathUtils.degToRad(-80.3), 0, 0)
);


// =============================
// LOOP
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