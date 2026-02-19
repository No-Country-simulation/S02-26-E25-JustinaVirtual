import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useNavigate } from "react-router-dom";

export default function SimuladorRenal3D() {
  const mountRef = useRef(null);
  const navigate = useNavigate();

  // Estados para UI (HUD)
  const [staplerCount, setStaplerCount] = useState(0);
  const [cutCount, setCutCount] = useState(0);
  const [activeTool, setActiveTool] = useState(null);

  // Refs para lógica de simulação (evita lags e resets)
  const staplerRef = useRef(0);
  const cutRef = useRef(0);
  const toolRef = useRef(null);
  const rotationRef = useRef(0);

  const MAX_STAPLERS = 6;
  const MAX_CUTS = 3;

  const organColors = {
    rim: { color: 0x992222, emissive: 0x441111 },
    kidney: { color: 0x992222, emissive: 0x441111 },
    veia: { color: 0x00aaff, emissive: 0x003366 },
    vein: { color: 0x00aaff, emissive: 0x003366 },
    arteria: { color: 0xff0000, emissive: 0x660000 },
    artery: { color: 0xff0000, emissive: 0x660000 },
    ureter: { color: 0xeeee00, emissive: 0x444400 },
    tecido: { color: 0xaaaaaa, emissive: 0x222222 },
  };

  // --- FUNÇÃO DE ENVIO DE DADOS ---
  const handleFinalizar = () => {
    const dadosParaEnvio = {
      staplersUsed: staplerRef.current,
      cutsMade: cutRef.current,
      totalPoints: (staplerRef.current * 10) + (cutRef.current * 20),
      timestamp: new Date().toLocaleTimeString()
    };
    
    console.log("Enviando para Dashboard:", dadosParaEnvio);
    // Certifique-se de que a rota /dashboard existe no seu App.js
    navigate("/dashboard", { state: dadosParaEnvio });
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.set(180, 120, 180); // Recuo equilibrado

    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 40; 
    controls.maxDistance = 600;

    const organsGroup = new THREE.Group();
    const markersGroup = new THREE.Group();
    scene.add(organsGroup, markersGroup);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(100, 100, 100);
    scene.add(dirLight);

    // --- HASTES ROBUSTAS ---
    const toolStapler = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 150, 16).rotateX(Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x00f2ff, metalness: 1, roughness: 0.2 })
    );
    const toolCutter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 150, 16).rotateX(Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xff0055, metalness: 1, roughness: 0.2 })
    );
    toolStapler.visible = toolCutter.visible = false;
    scene.add(toolStapler, toolCutter);

    const loader = new FBXLoader();
    const files = ["/models/pt3.fbx", "/models/pt4.fbx"];
    
    let loadedCount = 0;
    files.forEach((path) => {
      loader.load(path, (fbx) => {
        fbx.traverse((child) => {
          if (child.isMesh) {
            const name = child.name.toLowerCase();
            let style = organColors.tecido;
            for (const key in organColors) {
              if (name.includes(key)) { style = organColors[key]; break; }
            }
            child.material = new THREE.MeshLambertMaterial({
              color: style.color,
              emissive: style.emissive,
              side: THREE.DoubleSide
            });
          }
        });
        fbx.scale.set(5, 5, 5);
        organsGroup.add(fbx);
        loadedCount++;

        if (loadedCount === files.length) {
          const box = new THREE.Box3().setFromObject(organsGroup);
          const center = box.getCenter(new THREE.Vector3());
          organsGroup.position.sub(center);
          controls.target.set(0, 0, 0);
          controls.update();
        }
      });
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleDown = () => {
      if (!toolRef.current) return;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(organsGroup.children, true);

      if (hits.length > 0) {
        const hit = hits[0];
        const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
        let marker;

        if (toolRef.current === 5 && staplerRef.current < MAX_STAPLERS) {
          marker = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 3.5, 12).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x00f2ff }));
          staplerRef.current++;
          setStaplerCount(staplerRef.current);
        } else if (toolRef.current === 6 && cutRef.current < MAX_CUTS) {
          marker = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 5, 12).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff0055 }));
          cutRef.current++;
          setCutCount(cutRef.current);
        }

        if (marker) {
          marker.position.copy(hit.point).add(n.multiplyScalar(0.2));
          marker.lookAt(hit.point.clone().add(n));
          marker.rotateZ(rotationRef.current);
          markersGroup.add(marker);
        }
      }
    };

    const handleKey = (e) => {
      if (e.key === "5") { toolRef.current = 5; setActiveTool(5); }
      if (e.key === "6") { toolRef.current = 6; setActiveTool(6); }
      if (e.key.toLowerCase() === "r") rotationRef.current += Math.PI / 4;
    };

    window.addEventListener("keydown", handleKey);
    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointermove", (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    const animate = () => {
      requestAnimationFrame(animate);
      if (toolRef.current) {
        raycaster.setFromCamera(mouse, camera);
        const inter = raycaster.intersectObjects(organsGroup.children, true);
        const t = toolRef.current === 5 ? toolStapler : toolCutter;
        const other = toolRef.current === 5 ? toolCutter : toolStapler;
        other.visible = false;
        
        if (inter.length > 0) {
          t.visible = true;
          t.position.copy(inter[0].point);
          
          // SOLUÇÃO: Faz o braço olhar para a câmera e depois inverte
          // Isso garante que ele venha sempre do ponto de vista do cirurgião
          t.lookAt(camera.position);
          t.rotateZ(rotationRef.current);
          
          // Recua a haste para fora da tela (metade do comprimento 150)
          t.translateZ(-75); 
        } else t.visible = false;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("keydown", handleKey);
      renderer.dispose();
      if (mountRef.current) mountRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", position: "relative", overflow: "hidden", fontFamily: 'monospace' }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      
      <div style={{ position: "absolute", top: 20, left: 20, background: "rgba(0,10,20,0.9)", padding: "20px", borderRadius: "10px", border: "1px solid #00f2ff", color: "#fff", pointerEvents: "none" }}>
        <h3 style={{ color: "#00f2ff", margin: "0 0 10px 0" }}>CONTROLE ROBÓTICO</h3>
        GRAMPOS: {staplerCount}/{MAX_STAPLERS}<br />
        CORTES: {cutCount}/{MAX_CUTS}<br />
        <div style={{ fontSize: "11px", color: "#aaa", marginTop: "10px" }}>
          [5] GRAMPEADOR | [6] BISTURI | [R] GIRAR
        </div>
      </div>

      <button 
        onClick={handleFinalizar}
        style={{ position: "absolute", bottom: 40, right: 40, padding: "15px 45px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "50px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }}
      >
        CONCLUIR CIRURGIA
      </button>
    </div>
  );
}