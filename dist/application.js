"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
        var _this2 = this;

        this.context = new (window["AudioContext"] || window["webkitAudioContext"])();
        this.voice = null;
        this.config = new Config();

        this.initializeFrequencyField();

        this.config.on("change frequency", function () {
          document.querySelector("[name=frequency]").value = _this2.config.frequency;
          document.querySelector("title").innerHTML = _this2.config.frequency + "Hz";
          window.history.replaceState(null, null, Parameters.encode(_this2.config.asParameters()));
        });

        document.querySelector("[name=frequency]").addEventListener("change", function (e) {
          var freq = window.parseInt(e.target.value);
          if (!isNaN(freq)) {
            _this2.config.frequency = freq;
          }
        });

        document.querySelector("#playButton").addEventListener("touchstart", this.toggle.bind(this));

        this.config.updateFromParameters();
      }
    }, {
      key: "play",
      value: function play() {
        this.voice = new Voice({
          context: this.context,
          frequency: this.config.frequency
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

  var Parameters = function () {
    function Parameters() {
      _classCallCheck(this, Parameters);
    }

    _createClass(Parameters, null, [{
      key: "decode",

      // Parameters.decode(location.search)
      value: function decode(s) {
        var matches = s.match(/^\?(.+)$/);
        if (matches === null) {
          return {};
        }
        var params = {};

        matches[1].split("&").forEach(function (kv) {
          var k = void 0,
              v = void 0;

          var _kv$split$map = kv.split("=").map(function (e) {
            return window.decodeURIComponent(e);
          });

          var _kv$split$map2 = _slicedToArray(_kv$split$map, 2);

          k = _kv$split$map2[0];
          v = _kv$split$map2[1];

          params[k] = v;
        });
        return params;
      }

      // location.search = Parameters.encode({foo: 1})

    }, {
      key: "encode",
      value: function encode(o) {
        var kv = [];

        for (var k in o) {
          kv.push(window.encodeURIComponent(k) + "=" + window.encodeURIComponent(o[k]));
        }

        if (kv.length === 0) {
          return "";
        }

        return "?" + kv.join("&");
      }
    }]);

    return Parameters;
  }();

  var Config = function () {
    function Config() {
      _classCallCheck(this, Config);

      this.events = {};
    }

    _createClass(Config, [{
      key: "updateFromParameters",
      value: function updateFromParameters() {
        var params = Parameters.decode(location.search);
        if (params.f) {
          this.frequency = params.f;
        } else {
          this.frequency = Voice.DEFAULT_VALUES.frequency;
        }
      }
    }, {
      key: "asParameters",
      value: function asParameters() {
        var params = {};
        if (this.frequency) {
          params.f = this.frequency;
        }
        return params;
      }
    }, {
      key: "on",
      value: function on(name, callback) {
        this.events[name] = this.events[name] || [];
        this.events[name].push(callback);
      }
    }, {
      key: "trigger",
      value: function trigger(name) {
        var callbacks = this.events[name] || [];

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        for (var i = 0; i < callbacks.length; i++) {
          callbacks[i].apply(this, args);
        }
      }
    }, {
      key: "frequency",
      get: function get() {
        return this._frequency;
      },
      set: function set(v) {
        var old = this._frequency;
        if (old !== v) {
          this._frequency = v;
          this.trigger("change frequency", v);
        }
      }
    }]);

    return Config;
  }();

  new Application().run();
})();
