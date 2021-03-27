import { useState } from "react";
import { fft } from "@signalprocessing/transforms";

const n = 4096;
const maxFreq = 5000;
const createSineWave = (n) => {
  const result = [];

  for (let i = 0; i < n; i++) {
    result.push(Math.sin((i / n) * 2 * Math.PI));
  }

  return result;
};
const createPeriodicWave = (ac, pulwm, n) => {
  const sinewave = createSineWave(pulwm * n);
  const [realCoef, imagCoef] = fft(
    sinewave.concat(new Array(n - sinewave.length).fill(0))
  );

  return ac.createPeriodicWave(realCoef, imagCoef);
};

export default function usePulsar(ac, defaultPulwm, defaultFreq) {
  const [pulwm, setPulwm] = useState(defaultPulwm);
  const [freq, setFreq] = useState(defaultFreq);
  const [osc, setOsc] = useState(null);
  const [starting, setStarting] = useState(false);
  const _setPulwm = (pulwm) => {
    setPulwm(pulwm);

    if (osc) {
      const pw = createPeriodicWave(ac, pulwm ** 5, n);

      osc.setPeriodicWave(pw);
    }
  };
  const _setFreq = (freq) => {
    // freq: 0.0 - 1.0
    const f = freq ** 5 * maxFreq;

    setFreq(freq);

    if (osc) {
      osc.frequency.value = f;
    }
  };
  const _setStarting = (value) => {
    if (value) {
      if (!osc) {
        const o = ac.createOscillator();
        const pw = createPeriodicWave(ac, pulwm ** 5, n);

        o.setPeriodicWave(pw);
        o.connect(ac.destination);
        o.frequency.value = freq ** 5 * maxFreq;
        o.start();

        setOsc(o);
      }

      setStarting(true);
    } else {
      if (osc) {
        osc.stop();
        osc.disconnect();

        setOsc(null);
      }

      setStarting(false);
    }
  };

  return [freq, _setFreq, pulwm, _setPulwm, starting, _setStarting];
}
