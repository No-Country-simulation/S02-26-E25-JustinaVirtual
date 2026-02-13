export function createMetrics() {
  let startTime = null;
  let lastPoint = null;
  let lastTimestamp = null;

  let errors = 0;
  let lastSpeed = 0;
  let speedViolations = 0;

  let tremorAccum = 0;
  let tremorSamples = 0;

  let wasInside = true; // 🔑 controle de saída

  const MAX_SPEED = 2.5;
  const MIN_MOVEMENT = 0.6;
  const MIN_TREMOR_ANGLE = 0.08; // 🔧 menos sensível

  function reset() {
    startTime = null;
    lastPoint = null;
    lastTimestamp = null;

    errors = 0;
    lastSpeed = 0;
    speedViolations = 0;

    tremorAccum = 0;
    tremorSamples = 0;

    wasInside = true;
  }

  function update(isInside, path) {
    if (!path || path.length < 2) return;

    const now = performance.now();
    const current = path[path.length - 1];
    const prev = path[path.length - 2];

    if (!startTime) {
      startTime = now;
      lastPoint = prev;
      lastTimestamp = now;
      wasInside = isInside;
      return;
    }

    const dx = current.x - prev.x;
    const dy = current.y - prev.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < MIN_MOVEMENT) return;

    const dt = (now - lastTimestamp) / 1000;
    if (dt <= 0) return;

    lastSpeed = distance / dt;

    /* ❌ ERRO: conta só no momento da saída */
    if (wasInside && !isInside) {
      errors++;
    }
    wasInside = isInside;

    /* ⚡ VELOCIDADE */
    if (lastSpeed > MAX_SPEED) {
      speedViolations++;
    }

    /* 🫨 TREMOR SUAVIZADO */
    if (lastPoint) {
      const angle1 = Math.atan2(prev.y - lastPoint.y, prev.x - lastPoint.x);
      const angle2 = Math.atan2(current.y - prev.y, current.x - prev.x);

      let deltaAngle = Math.abs(angle2 - angle1);
      if (deltaAngle > Math.PI) {
        deltaAngle = Math.PI * 2 - deltaAngle;
      }

      // 🔕 ignora micro tremor
      if (deltaAngle > MIN_TREMOR_ANGLE) {
        tremorAccum += deltaAngle;
        tremorSamples++;
      }
    }

    lastPoint = prev;
    lastTimestamp = now;
  }

  function getElapsedTime() {
    if (!startTime) return 0;
    return ((performance.now() - startTime) / 1000).toFixed(1);
  }

  function getTremorScore() {
    if (tremorSamples === 0) return 0;
    return (tremorAccum / tremorSamples).toFixed(3);
  }

  return {
    update,
    reset,
    getElapsedTime,
    getTremorScore,

    get errors() {
      return errors;
    },

    get lastSpeed() {
      return lastSpeed;
    },

    get speedViolations() {
      return speedViolations;
    }
  };
}