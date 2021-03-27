import "./styles.css";
import usePulsar from "./usePulsar";
import Slider from "react-input-slider";

export default function App(props) {
  const { ac } = props;
  const [freq, setFreq, pulwm, setPulwm, starting, setStarting] = usePulsar(
    ac,
    0.3,
    0.3
  );

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
          onChange={(event) => setFreq(event.target.value)}
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
          onChange={(event) => setPulwm(event.target.value)}
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
          onChange={(values) => {
            setFreq(values.x);
            setPulwm(values.y);
          }}
        />
      </div>
      <div className="control">
        <button onClick={() => setStarting(!starting)}>
          {starting ? "stop" : "start"}
        </button>
      </div>
    </div>
  );
}
