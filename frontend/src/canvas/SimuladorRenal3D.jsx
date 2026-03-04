import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/apiService";

export default function SimuladorRenal3D() {
  const mountRef = useRef(null);
  const navigate = useNavigate();

  // Estados para UI e Desafios
  const [staplerCount, setStaplerCount] = useState(0);
  const [cutCount, setCutCount] = useState(0);
  const [activeTool, setActiveTool] = useState(null);
  const [message, setMessage] = useState("OBJETIVO: Identifique e clampeie a Artéria Renal.");
  const [timer, setTimer] = useState(0);
  const [isVascularClamped, setIsVascularClamped] = useState(false);

  // Estados de Telemetria (Para Banco de Dados)
  const [errors, setErrors] = useState(0);
  const [hits, setHits] = useState(0);
  const [sessionLog, setSessionLog] = useState([]);

  // Estados de sessão
  const [sessionId, setSessionId] = useState(null);
  const telemetryBuffer = useRef([]);
  const isFinalized = useRef(false);

  // Refs de lógica
  const staplerRef = useRef(0);
  const cutRef = useRef(0);
  const toolRef = useRef(null);
  const rotationRef = useRef(0);
  const clampedRef = useRef(false);
  const logRef = useRef([]);
  const errorsRef = useRef(0);
  const hitsRef = useRef(0);
  
  const MAX_STAPLERS = 6;
  const MAX_CUTS = 3;

  const organColors = {
    rim: { color: 0x992222, emissive: 0x441111 },
    kidney: { color: 0x992222, emissive: 0x441111 },
    vein: { color: 0x0044ff, emissive: 0x001144 },
    artery: { color: 0xff0000, emissive: 0x440000 },
    ureter: { color: 0xeeee00, emissive: 0x333300 },
  };

  // Inicia coleta de dados ao montar
  useEffect(() => {
    const iniciarColeta = async () => {
      try {
        const dadosSalvos = localStorage.getItem("justina_user");
        if (dadosSalvos) {
          const user = JSON.parse(dadosSalvos);
          const response = await apiService.startDataCollection(user.email, "renal_surgery_3d");
          setSessionId(response.session_id);
        }
      } catch (error) {
        console.error("Erro ao iniciar coleta:", error);
      }
    };
    iniciarColeta();
  }, []);

  // Envia dados em lote periodicamente
  useEffect(() => {
    if (!sessionId || isFinalized.current) return;

    const interval = setInterval(async () => {
      if (telemetryBuffer.current.length > 0) {
        try {
          await apiService.sendTelemetryBatch(sessionId, telemetryBuffer.current);
          telemetryBuffer.current = [];
        } catch (error) {
          console.error("Erro ao enviar lote:", error);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const recordEvent = (type, description, status) => {
    const event = {
      timestamp: new Date().toISOString(),
      gameTime: timer,
      type: type,
      description: description,
      status: status
    };
    
    logRef.current.push(event);
    if (status === 'SUCCESS') {
      hitsRef.current++;
      setHits(hitsRef.current);
    } else {
      errorsRef.current++;
      setErrors(errorsRef.current);
    }
    setSessionLog([...logRef.current]);

    // Registra evento para análise
    const telemetryPoint = {
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 10,
      timestamp: Date.now(),
      event_type: type,
      event_status: status
    };
    telemetryBuffer.current.push(telemetryPoint);
  };

  const calculateAccuracy = () => {
    const totalActions = hitsRef.current + errorsRef.current;
    return totalActions === 0 ? 0 : Math.round((hitsRef.current / totalActions) * 100);
  };

  const handleFinalizar = async () => {
    if (isFinalized.current) return;
    isFinalized.current = true;

    const dadosCirurgia = {
      session_id: Date.now(),
      user_id: "current_user_id",
      date: new Date().toISOString(),
      duration_seconds: timer,
      metrics: {
        total_clips: staplerRef.current,
        total_cuts: cutRef.current,
        total_errors: errorsRef.current,
        total_hits: hitsRef.current,
        accuracy_percentage: calculateAccuracy(),
        vascular_control_success: clampedRef.current
      },
      events_timeline: logRef.current,
      final_status: clampedRef.current ? "SUCCESS" : "CRITICAL_FAILURE"
    };

    const historico = JSON.parse(localStorage.getItem("historico_cirurgias") || "[]");
    localStorage.setItem("historico_cirurgias", JSON.stringify([dadosCirurgia, ...historico]));

    // Finaliza coleta de dados
    if (sessionId) {
      try {
        // Envia dados restantes no buffer
        if (telemetryBuffer.current.length > 0) {
          await apiService.sendTelemetryBatch(sessionId, telemetryBuffer.current);
          telemetryBuffer.current = [];
        }

        // Completa a sessão
        await apiService.completeDataCollection(sessionId);
      } catch (error) {
        console.error("Erro ao finalizar sessao:", error);
      }
    }

    navigate("/dashboard");
  };

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020202);

    // Camera: Near plane reduzido para 0.01 para permitir zoom extremo sem "atravessar" a geometria
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.01, 10000);
    camera.position.set(60, 40, 60);

    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    
    // CORREÇÃO: enableDamping false remove o efeito de deslize residual do mouse
    controls.enableDamping = false; 
    
    // AJUSTE DE ZOOM: minDistance reduzido para 1 para permitir chegar muito perto
    controls.minDistance = 1; 
    controls.maxDistance = 500;
    controls.target.set(0, 0, 0);

    const createTool = (type) => {
      const group = new THREE.Group();
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 120, 16),
        new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.9, roughness: 0.1 })
      );
      shaft.rotation.x = Math.PI / 2;
      shaft.position.z = -60;
      group.add(shaft);

      if (type === 'stapler') {
        const head = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 0.8, 5),
          new THREE.MeshStandardMaterial({ color: 0x00f2ff, emissive: 0x00f2ff, emissiveIntensity: 0.5 })
        );
        group.add(head);
      } else {
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 2.5, 4),
          new THREE.MeshStandardMaterial({ color: 0xff0055, emissive: 0xff0055, emissiveIntensity: 0.5 })
        );
        blade.position.z = 1;
        group.add(blade);
      }
      return group;
    };

    const staplerTool = createTool('stapler');
    const cutterTool = createTool('cutter');
    staplerTool.visible = cutterTool.visible = false;
    scene.add(staplerTool, cutterTool);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, 1.2));
    const spotLight = new THREE.SpotLight(0xffffff, 2);
    spotLight.position.set(100, 200, 100);
    scene.add(spotLight);

    const organsGroup = new THREE.Group();
    const markersGroup = new THREE.Group();
    scene.add(organsGroup, markersGroup);

    const loader = new FBXLoader();
    const models = ["/models/pt3.fbx", "/models/pt4.fbx"];
    
    models.forEach(path => {
      loader.load(path, (fbx) => {
        fbx.traverse(c => {
          if (c.isLine || c.isLineSegments || c.name.toLowerCase().includes('line')) {
            c.visible = false;
            return;
          }
          if (c.isMesh) {
            const name = c.name.toLowerCase();
            let style = { color: 0x444444, emissive: 0x111111 };
            for(let k in organColors) if(name.includes(k)) style = organColors[k];
            c.material = new THREE.MeshStandardMaterial({
              color: style.color,
              emissive: style.emissive,
              roughness: 0.6,
              metalness: 0.2,
              side: THREE.DoubleSide
            });
          }
        });
        fbx.scale.set(5, 5, 5);
        organsGroup.add(fbx);
        
        const box = new THREE.Box3().setFromObject(organsGroup);
        const center = box.getCenter(new THREE.Vector3());
        organsGroup.position.sub(center);
        controls.target.set(0, 0, 0);
      });
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleDown = () => {
      if (!toolRef.current) return;
      raycaster.setFromCamera(mouse, camera);
      const hits_inter = raycaster.intersectObjects(organsGroup.children, true);

      if (hits_inter.length > 0) {
        const hit = hits_inter[0];
        const targetName = hit.object.name.toLowerCase();
        const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
        let marker;

        // CORREÇÃO: Sempre criar o marcador visual, independente do resultado
        if (toolRef.current === 5 && staplerRef.current < MAX_STAPLERS) {
          // Cria o marcador primeiro (sempre aparece)
          marker = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.4, 4), 
            new THREE.MeshStandardMaterial({ 
              color: 0x00f2ff,
              emissive: 0x0066aa,
              emissiveIntensity: 0.3
            })
          );
          
          staplerRef.current++;
          setStaplerCount(staplerRef.current);

          // CORREÇÃO: Verifica se é artéria, veia OU ureter (amarelo)
          if (targetName.includes("artery") || targetName.includes("vein") || targetName.includes("ureter")) {
            clampedRef.current = true;
            setIsVascularClamped(true);
            setMessage("SUCESSO: Fluxo vascular interrompido.");
            recordEvent('CLIPPING', `Clip aplicado em: ${targetName}`, 'SUCCESS');
          } else {
            setMessage("AVISO: Grampo fora da zona vascular!");
            recordEvent('CLIPPING', `Clip incorreto em: ${targetName}`, 'ERROR');
          }
        } 
        else if (toolRef.current === 6 && cutRef.current < MAX_CUTS) {
          // Cria o marcador primeiro (sempre aparece)
          marker = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 1.5, 5), 
            new THREE.MeshStandardMaterial({ 
              color: 0xff0055,
              emissive: 0x440000,
              emissiveIntensity: 0.5
            })
          );
          
          cutRef.current++;
          setCutCount(cutRef.current);

          // CORREÇÃO: Verifica se é artéria, veia OU ureter (amarelo)
          if (!clampedRef.current) {
            setMessage("ERRO CRÍTICO: Hemorragia severa detectada!");
            recordEvent('CUTTING', 'Corte realizado sem clampeamento vascular', 'ERROR');
          } else {
            setMessage("CORTE REALIZADO: Tecido removido.");
            recordEvent('CUTTING', `Corte de precisão em: ${targetName}`, 'SUCCESS');
          }
        }

        // CORREÇÃO: Posiciona o marcador se ele foi criado
        if (marker) {
          marker.position.copy(hit.point).add(n.multiplyScalar(0.1));
          marker.lookAt(hit.point.clone().add(n));
          marker.rotateZ(rotationRef.current);
          markersGroup.add(marker);
        }
      }
    };

    const handleKey = (e) => {
      // NOVA FUNÇÃO: Tecla 4 para desativar a ferramenta atual
      if (e.key === "4") { 
        toolRef.current = null; 
        setActiveTool(null);
        staplerTool.visible = false;
        cutterTool.visible = false;
      }
      if (e.key === "5") { 
        toolRef.current = 5; 
        setActiveTool(5);
      }
      if (e.key === "6") { 
        toolRef.current = 6; 
        setActiveTool(6);
      }
      if (e.key.toLowerCase() === "r") rotationRef.current += Math.PI / 8;
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
        const t = toolRef.current === 5 ? staplerTool : cutterTool;
        const other = toolRef.current === 5 ? cutterTool : staplerTool;
        other.visible = false;
        if (inter.length > 0) {
          t.visible = true;
          t.position.copy(inter[0].point);
          t.lookAt(camera.position);
          t.rotateZ(rotationRef.current);
        } else t.visible = false;
      } else {
        // Se não há ferramenta ativa, esconde ambas
        staplerTool.visible = false;
        cutterTool.visible = false;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("keydown", handleKey);
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", position: "relative", overflow: "hidden", fontFamily: 'sans-serif' }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      
      <div style={{ position: "absolute", top: 20, width: "100%", display: "flex", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ background: "rgba(0,0,0,0.8)", border: "1px solid #333", padding: "10px 30px", borderRadius: "30px", color: "#fff", textAlign: "center", display: "flex", gap: "20px" }}>
          <div><span style={{ color: "#00f2ff" }}>TEMPO:</span> {timer}s</div>
          <div><span style={{ color: "#44ff44" }}>PRECISÃO:</span> {calculateAccuracy()}%</div>
        </div>
      </div>

      <div style={{ position: "absolute", top: 30, left: 30, pointerEvents: "none", maxWidth: "350px" }}>
        <div style={{ background: "rgba(0,15,30,0.9)", padding: "20px", borderRadius: "8px", borderLeft: "5px solid #00f2ff", color: "#fff" }}>
          <h2 style={{ fontSize: "12px", letterSpacing: "2px", margin: "0 0 10px 0", color: "#00f2ff" }}>MODULO DE TELEMETRIA</h2>
          <div style={{ fontSize: "14px", lineHeight: "1.4", marginBottom: "15px", color: isVascularClamped ? "#44ff44" : "#ffcc00" }}>
            {message}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "13px" }}>
            <div style={{ flex: "1 1 40%" }}>ACERTOS: <span style={{ color: "#44ff44" }}>{hits}</span></div>
            <div style={{ flex: "1 1 40%" }}>ERROS: <span style={{ color: "#ff4444" }}>{errors}</span></div>
            <div style={{ flex: "1 1 40%" }}>CLIPS: {staplerCount}/{MAX_STAPLERS}</div>
            <div style={{ flex: "1 1 40%" }}>CORTES: {cutCount}/{MAX_CUTS}</div>
          </div>
        </div>

        <div style={{ marginTop: "10px", background: "rgba(0,0,0,0.5)", padding: "10px", borderRadius: "4px", fontSize: "10px", maxHeight: "150px", overflowY: "auto", color: "#aaa" }}>
          {sessionLog.slice().reverse().map((ev, i) => (
            <div key={i} style={{ marginBottom: "4px", borderBottom: "1px solid #222" }}>
              [{ev.gameTime}s] <span style={{ color: ev.status === 'SUCCESS' ? '#44ff44' : '#ff4444' }}>{ev.type}</span>: {ev.description}
            </div>
          ))}
        </div>
      </div>

      {/* NOVA DESCRIÇÃO: Barra de ferramentas com indicador visual e teclas */}
      <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <div style={{ display: "flex", gap: "15px" }}>
          <div style={{ 
            padding: "12px 25px", 
            borderRadius: "5px", 
            background: activeTool === 5 ? "#00f2ff" : "#111", 
            color: activeTool === 5 ? "#000" : "#666", 
            fontWeight: "bold", 
            border: activeTool === 5 ? "2px solid #fff" : "1px solid #333",
            boxShadow: activeTool === 5 ? "0 0 15px #00f2ff" : "none",
            transition: "all 0.2s"
          }}>
            [5] GRAMPEADOR
          </div>
          <div style={{ 
            padding: "12px 25px", 
            borderRadius: "5px", 
            background: activeTool === 6 ? "#ff0055" : "#111", 
            color: activeTool === 6 ? "#000" : "#666", 
            fontWeight: "bold", 
            border: activeTool === 6 ? "2px solid #fff" : "1px solid #333",
            boxShadow: activeTool === 6 ? "0 0 15px #ff0055" : "none",
            transition: "all 0.2s"
          }}>
            [6] BISTURI
          </div>
          <div style={{ 
            padding: "12px 25px", 
            borderRadius: "5px", 
            background: "#222", 
            color: "#fff", 
            fontWeight: "bold", 
            border: "1px solid #333" 
          }}>
            [R] GIRAR
          </div>
          <div style={{ 
            padding: "12px 25px", 
            borderRadius: "5px", 
            background: activeTool === null ? "#444" : "#222", 
            color: activeTool === null ? "#fff" : "#666", 
            fontWeight: "bold", 
            border: activeTool === null ? "2px solid #fff" : "1px solid #333",
            boxShadow: activeTool === null ? "0 0 15px #ffffff" : "none",
            transition: "all 0.2s"
          }}>
            [4] PARAR USO
          </div>
        </div>
        
        {/* Indicador visual da ferramenta ativa */}
        <div style={{ 
          background: "rgba(0,0,0,0.6)", 
          padding: "5px 15px", 
          borderRadius: "20px",
          border: "1px solid #333",
          color: activeTool === 5 ? "#00f2ff" : activeTool === 6 ? "#ff0055" : "#888",
          fontSize: "14px",
          fontWeight: "bold"
        }}>
          {activeTool === 5 ? "🔵 FERRAMENTA ATIVA: Grampeador" : 
           activeTool === 6 ? "🔴 FERRAMENTA ATIVA: Bisturi" : 
           "⚪ NENHUMA FERRAMENTA ATIVA"}
        </div>
      </div>

      <button 
        onClick={handleFinalizar}
        style={{ 
          position: "absolute", bottom: 40, right: 40, 
          padding: "20px 40px", background: clampedRef.current ? "#10b981" : "#dc2626", 
          color: "#fff", border: "none", borderRadius: "5px", 
          fontWeight: "bold", cursor: "pointer", fontSize: "14px",
          textTransform: "uppercase", transition: "0.3s",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)"
        }}
      >
        Finalizar e Gerar Relatório
      </button>
    </div>
  );
}