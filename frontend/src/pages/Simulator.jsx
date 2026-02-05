import RenalCanvas from "../canvas/RenalCanvas";

export default function Simulator() {
  return (
    <div style={{ padding: 24, color: "#e5e7eb" }}>
      <h1>Justina — Simulador Cirúrgico</h1>
      <p>Interaja com o ambiente simulando o instrumento cirúrgico.</p>
      <RenalCanvas />
    </div>
  );
}
