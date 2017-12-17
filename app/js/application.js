(function(){
  class Voice {
    constructor(props) {
      this.context = props.context;
      this.frequency = props.frequency || Voice.DEFAULT_VALUES.frequency;
      this.volume = props.volume || Voice.DEFAULT_VALUES.volume;
      this.attack = props.attack || Voice.DEFAULT_VALUES.attack;
      this.release = props.release || Voice.DEFAULT_VALUES.release;
      this.isPlaying = false;
    }

    play() {
      const now = this.context.currentTime;

      this.gain = this.context.createGain();
      this.gain.gain.setValueAtTime(0, now);
      this.gain.gain.linearRampToValueAtTime(this.volume, now + this.attack);
      this.gain.connect(this.context.destination);

      this.osc = this.context.createOscillator();
      this.osc.frequency.value = this.frequency;
      this.osc.connect(this.gain);

      this.osc.start(now);

      this.isPlaying = true;
    }

    stop() {
      const now = this.context.currentTime
      this.gain.gain.cancelScheduledValues(now);
      this.gain.gain.setValueAtTime(this.gain.gain.value, now)
      this.gain.gain.linearRampToValueAtTime(0, now + this.release);
      this.osc.addEventListener("ended", ()=> {
        this.gain.disconnect(this.context);
      });
      this.osc.stop(now + this.release);

      this.isPlaying = false;
    }

    toggle() {
      if (this.isPlaying) {
        this.stop();
      } else {
        this.play();
      }
    }
  }

  Voice.DEFAULT_VALUES = {
    volume: 1.0,
    frequency: 440,
    attack: 0.02,
    release: 0.1,
  };

  class Application {
    run() {
      this.context = new (window["AudioContext"] || window["webkitAudioContext"])();
      this.voice = null;
      this.config = new Config();

      this.initializeFrequencyField();

      this.config.on("change frequency", ()=> {
        document.querySelector("[name=frequency]").value = this.config.frequency;
        document.querySelector("title").innerHTML = `${this.config.frequency}Hz`;
      });

      this.config.on("change", ()=> {
        window.history.replaceState(null, null, Parameters.encode(this.config.asParameters()));
      });


      document.querySelector("[name=frequency]").addEventListener("change", (e)=> {
        const freq = window.parseInt(e.target.value);
        if (!isNaN(freq)) {
          this.config.frequency = freq;
        }
      });

      document.querySelector("#playButton").addEventListener("touchstart", this.toggle.bind(this));
      document.querySelector("#playButton").addEventListener("mousedown", this.toggle.bind(this));
      // disable scroll
      window.addEventListener("touchmove", e => e.preventDefault());

      this.config.updateFromParameters();
    }

    play() {
      this.voice = new Voice({
        context: this.context,
        frequency: this.config.frequency,
        volume: this.config.volume,
      });
      this.voice.play();

      const label = document.querySelector(".playButton-label");
      label.classList.add("isPlay");
      label.classList.remove("isPause");
    }

    stop() {
      this.voice.stop();
      this.voice = null;

      const label = document.querySelector(".playButton-label");
      label.classList.add("isPause");
      label.classList.remove("isPlay");
    }

    toggle(e) {
      e.preventDefault(); // trigger by touchstart or mousedown (not both)
      if (this.voice) {
        this.stop()
      } else {
        this.play()
      }
    }

    initializeFrequencyField() {
      const select = document.querySelector("[name=frequency]");
      for (let i = 349; i <=499; i++) {
        const option = document.createElement("option");
        option.setAttribute("value", i.toString());
        option.innerHTML = `A = ${i}Hz`;
        select.appendChild(option);
      }
    }
  }

  class Parameters {
    // Parameters.decode(location.search)
    static decode(s) {
      const matches = s.match(/^\?(.+)$/)
      if (matches === null) { return {}; }
      let params = {};

      matches[1].split("&").forEach(function(kv){
        let k, v;
        [k, v] = kv.split("=").map(e => window.decodeURIComponent(e));
        params[k] = v;
      })
      return params;
    }

    // location.search = Parameters.encode({foo: 1})
    static encode(o) {
      let kv = [];

      for (const k in o) {
        kv.push(window.encodeURIComponent(k) + "=" + window.encodeURIComponent(o[k]));
      }

      if (kv.length === 0) { return ""; }

      return "?" + kv.join("&");
    }
  }

  class Config {
    constructor() {
      this.events = {};
    }

    updateFromParameters() {
      const params = Parameters.decode(location.search);
      if (params.f) {
        this.frequency = params.f;
      } else {
        this.frequency = Voice.DEFAULT_VALUES.frequency;
      }

      if (params.v) { this.volume = params.v; }
    }

    asParameters() {
      const params = {};
      if (this.frequency) { params.f = this.frequency; }
      if (this.volume) { params.v = this.volume; }
      return params;
    }

    get frequency() {
      return this._frequency;
    }

    set frequency(v) {
      const old = this._frequency;
      if (old !== v) {
        this._frequency = v;
        this.trigger("change frequency", v);
        this.trigger("change");
      }
    }

    get volume() {
      return this._volume;
    }

    set volume(v) {
      const old = this._volume;
      if (old !== v) {
        this._volume = v;
        this.trigger("change volume", v);
        this.trigger("change");
      }
    }

    on(name, callback) {
      this.events[name] = this.events[name] || [];
      this.events[name].push(callback);
    }

    trigger(name, ...args) {
      const callbacks = this.events[name] || [];

      for (let i = 0; i < callbacks.length; i++) {
        callbacks[i].apply(this, args);
      }
    }
  }

  new Application().run();
}());
