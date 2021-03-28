import { useState, useCallback, useRef } from "react";
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
  const [starting, setStarting] = useState(false);
  const oscRef = useRef(null);

  const _setPulwm = useCallback(
    (pulwm) => {
      setPulwm(pulwm);

      if (oscRef.current) {
        const pw = createPeriodicWave(ac, pulwm ** 5, n);

        oscRef.current.setPeriodicWave(pw);
      }
    },
    [setPulwm]
  );
  const _setFreq = useCallback(
    (freq) => {
      // freq: 0.0 - 1.0
      const f = freq ** 5 * maxFreq;

      setFreq(freq);

      if (oscRef.current) {
        oscRef.current.frequency.value = f;
      }
    },
    [setFreq]
  );
  const _setStarting = useCallback(
    (value) => {
      if (value) {
        if (!oscRef.current) {
          const o = ac.createOscillator();
          const pw = createPeriodicWave(ac, pulwm ** 5, n);

          o.setPeriodicWave(pw);
          o.connect(ac.destination);
          o.frequency.value = freq ** 5 * maxFreq;
          o.start();

          oscRef.current = o;
        }

        setStarting(true);
      } else {
        if (oscRef.current) {
          oscRef.current.stop();
          oscRef.current.disconnect();

          oscRef.current = null;
        }

        setStarting(false);
      }
    },
    [setStarting]
  );

  return [freq, _setFreq, pulwm, _setPulwm, starting, _setStarting];
}
