"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  var Voice = function () {
    function Voice(props) {
      _classCallCheck(this, Voice);

      this.context = props.context;
      this.frequency = props.frequency || Voice.DEFAULT_VALUES.frequency;
      this.volume = props.volume || Voice.DEFAULT_VALUES.volume;
      this.attack = props.attack || Voice.DEFAULT_VALUES.attack;
      this.release = props.release || Voice.DEFAULT_VALUES.release;
      this.isPlaying = false;
    }

    _createClass(Voice, [{
      key: "play",
      value: function play() {
        var now = this.context.currentTime;

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
    }, {
      key: "stop",
      value: function stop() {
        var _this = this;

        var now = this.context.currentTime;
        this.gain.gain.cancelScheduledValues(now);
        this.gain.gain.setValueAtTime(this.gain.gain.value, now);
        this.gain.gain.linearRampToValueAtTime(0, now + this.release);
        this.osc.addEventListener("ended", function () {
          _this.gain.disconnect(_this.context);
        });
        this.osc.stop(now + this.release);

        this.isPlaying = false;
      }
    }, {
      key: "toggle",
      value: function toggle() {
        if (this.isPlaying) {
          this.stop();
        } else {
          this.play();
        }
      }
    }]);

    return Voice;
  }();

  Voice.DEFAULT_VALUES = {
    volume: 0.7,
    frequency: 440,
    attack: 0.02,
    release: 0.1
  };

  var Application = function () {
    function Application() {
      _classCallCheck(this, Application);
    }

    _createClass(Application, [{
      key: "run",
      value: function run() {
        this.context = new (window["AudioContext"] || window["webkitAudioContext"])();
        this.voice = null;
        this.initializeFrequencyField();
        this.updateFrequency(this.getFrequencyFromHash());

        document.querySelector("[name=frequency]").addEventListener("change", this.onFrequencyChange.bind(this));
        document.querySelector("#playButton").addEventListener("touchstart", this.toggle.bind(this));
      }
    }, {
      key: "play",
      value: function play() {
        this.voice = new Voice({
          context: this.context,
          frequency: this.frequency
        });
        this.voice.play();

        var label = document.querySelector(".playButton-label");
        label.classList.add("isPlay");
        label.classList.remove("isPause");
      }
    }, {
      key: "stop",
      value: function stop() {
        this.voice.stop();
        this.voice = null;

        var label = document.querySelector(".playButton-label");
        label.classList.add("isPause");
        label.classList.remove("isPlay");
      }
    }, {
      key: "toggle",
      value: function toggle() {
        if (this.voice) {
          this.stop();
        } else {
          this.play();
        }
      }
    }, {
      key: "updateFrequency",
      value: function updateFrequency(freq) {
        this.frequency = freq;
        document.querySelector("[name=frequency]").value = freq;
        document.querySelector("title").innerHTML = "A=" + freq + "Hz";
      }
    }, {
      key: "getFrequencyFromHash",
      value: function getFrequencyFromHash() {
        var matches = location.hash.match(/#(\d+)/);
        if (matches === null) {
          return Voice.DEFAULT_VALUES.frequency;
        }
        return window.parseInt(matches[1], 10);
      }
    }, {
      key: "onFrequencyChange",
      value: function onFrequencyChange(e) {
        var freq = window.parseInt(e.target.value);
        if (!isNaN(freq)) {
          location.hash = "#" + freq;
          this.updateFrequency(freq);
        }
      }
    }, {
      key: "initializeFrequencyField",
      value: function initializeFrequencyField() {
        var select = document.querySelector("[name=frequency]");
        for (var i = 349; i <= 499; i++) {
          var option = document.createElement("option");
          option.setAttribute("value", i.toString());
          option.innerHTML = "A = " + i + "Hz";
          select.appendChild(option);
        }
      }
    }]);

    return Application;
  }();

  new Application().run();
})();
