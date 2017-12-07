// document.addEventListener("DOMContentLoaded", function() {
(function(){
  var context = new (window["AudioContext"] || window["webkitAudioContext"])();
  var gain = context.createGain();
  var osc = context.createOscillator();
  var isPlaying = false;

  var volume = 0.5;
  var frequency = 440;
  var attack = 0.02;
  var release = 0.1;

  osc.frequency.value = 440;
  osc.connect(gain);

  gain.gain.setValueAtTime(0, context.currentTime);
  gain.connect(context.destination);


  play = function() {
    now = context.currentTime
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    osc.start(now);
    isPlaying = true;
  }

  stop = function() {
    now = context.currentTime
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now)
    gain.gain.linearRampToValueAtTime(0, now + release);
    osc.stop(now + release);
    isPlaying = false;
  }

  toggle = function() {
    console.log(isPlaying);
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }

  document.querySelector("#playButton").addEventListener("touchstart", toggle);
  // document.querySelector("#playButton").addEventListener("mousedown", toggle);
}());
