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
    volume: 0.5,
    frequency: 440,
    attack: 0.02,
    release: 0.1,
  };


  class Application {
    run() {
      this.context = new (window["AudioContext"] || window["webkitAudioContext"])();
      this.voice = null;

      document.querySelector("#playButton").addEventListener("touchstart", this.toggle.bind(this));
    }

    play() {
      this.voice = new Voice({context: this.context});
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
  }

  new Application().run();
}());
