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
    volume: 0.7,
    frequency: 440,
    attack: 0.02,
    release: 0.1,
  };

  class Application {
    run() {
      this.context = new (window["AudioContext"] || window["webkitAudioContext"])();
      this.voice = null;

      const select = document.querySelector("[name=frequency]");
      for (let i = 349; i <=499; i++) {
        const option = document.createElement("option");
        option.setAttribute("value", i.toString());
        option.innerHTML = i.toString();
        select.appendChild(option);
      }

      this.updateFrequency(this.getFrequencyFromHash());

      document.querySelector("[name=frequency]").addEventListener("change", this.onFrequencyChange.bind(this));
      document.querySelector("#playButton").addEventListener("touchstart", this.toggle.bind(this));
    }

    play() {
      this.voice = new Voice({
        context: this.context,
        frequency: this.frequency,
      });
      this.voice.play();
    }

    stop() {
      this.voice.stop();
      this.voice = null;
    }

    toggle() {
      if (this.voice) {
        this.stop()
      } else {
        this.play()
      }
    }

    updateFrequency(freq) {
      this.frequency = freq;
      document.querySelector("[name=frequency]").value = freq;
      document.querySelector("title").innerHTML = `A=${freq}Hz`;
    }

    getFrequencyFromHash() {
      const matches = location.hash.match(/#(\d+)/);
      if (matches === null) { 
        return Voice.DEFAULT_VALUES.frequency;
      }
      return window.parseInt(matches[1], 10);
    }

    onFrequencyChange(e) {
      const freq = window.parseInt(e.target.value);
      if (!isNaN(freq)) {
        location.hash = `#${freq}`;
        this.updateFrequency(freq);
      }
    }
  }

  new Application().run();
}());
