import "./styles.css";
import { useState } from "react";
import { fft } from "@signalprocessing/transforms";
import Slider from "react-input-slider";

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

export default function App(props) {
  const { ac } = props;
  const [pulwm, setPulwm] = useState(0.3);
  const [freq, setFreq] = useState(1500 / maxFreq);
  const [osc, setOsc] = useState(null);
  const [starting, setStarting] = useState(false);

  const onClickStartButton = (event) => {
    if (osc || starting) {
      osc.stop();
      osc.disconnect();

      if (starting) {
        setStarting(false);
        return;
      }
    }

    const o = ac.createOscillator();
    const pw = createPeriodicWave(ac, pulwm ** 5, n);

    o.setPeriodicWave(pw);
    o.connect(ac.destination);
    o.frequency.value = freq ** 5 * maxFreq;
    o.start();

    setOsc(o);
    setStarting(true);
  };
  const onChangePulwmSlider = (event) => {
    setPulwm(event.target.value);

    if (osc) {
      const pw = createPeriodicWave(ac, pulwm ** 5, n);

      osc.setPeriodicWave(pw);
    }
  };
  const onChangeFreqSlider = (event) => {
    const value = event.target.value;
    const f = value ** 5 * maxFreq;

    setFreq(value);

    if (osc) {
      osc.frequency.value = f;
    }
  };
  const onChangeXYSlider = (values) => {
    const f = values.x;
    const p = values.y;

    setFreq(f);
    setPulwm(p);

    if (osc) {
      const pw = createPeriodicWave(ac, p ** 5, n);

      osc.setPeriodicWave(pw);
      osc.frequency.value = f ** 5 * maxFreq;
    }
  };

  return (
    <div className="App">
      <h1>Pulsar Synthesis</h1>
      <p>
        <a href="https://archive.org/details/soundcompwithpulsars">
          https://archive.org/details/soundcompwithpulsars
        </a>
      </p>
      <div className="control">
        <label>Frequency</label>
        <input
          onChange={onChangeFreqSlider}
          type="range"
          min={0.1}
          max={1.0}
          step="0.001"
          value={freq}
        />
      </div>
      <div className="control">
        <label>PulWM</label>
        <input
          onChange={onChangePulwmSlider}
          step="0.001"
          min={0.1}
          max={1.0}
          type="range"
          value={pulwm}
        />
      </div>{" "}
      <div className="control">
        <Slider
          axis="xy"
          x={freq}
          y={pulwm}
          xmin={0.1}
          xmax={1.0}
          ymin={0.1}
          ymax={1.0}
          xstep={0.001}
          ystep={0.001}
          yreverse={true}
          onChange={onChangeXYSlider}
        />
      </div>
      <div className="control">
        <button onClick={onClickStartButton}>
          {starting ? "stop" : "start"}
        </button>
      </div>
    </div>
  );
}
