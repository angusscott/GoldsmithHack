/**
 * Created by David on 07/05/2016.
 */

var data = [5, 7, 1, 10, 11, 20, 15, 1, 20],
    context = new AudioContext(),
    masterVolume = context.createGain(),
    startTime = context.currentTime,
    frequency = 493.883, // 'B' note
    duration = 10;

var maxvol = 0.3,
    minvol = 0.01,
    minfreq = frequency-5,
    maxfreq = frequency+5;

// Scale data (domain) to volume interval (range)
var linearScale = function(x, range0, range1) { // What about logarithmic?
    var a = Math.min.apply(null, data);
    var b = Math.max.apply(null, data);
    var c = range0;
    var d = range1;
    return(c*(x-a)/(b-a) + d*(x-a)/(b-a));
};

var interval = duration/data.length,
    volumes = [],
    frequencies = [];

for(var i=0; i<data.length; i++) {
    volumes.push(linearScale(data[i], minvol, maxvol));
    frequencies.push(linearScale(data[i], minfreq, maxfreq));
};

// Set the volume not too loud
masterVolume.gain.value = 0.1;

// Create wave oscillator
var osc = context.createOscillator();

// Set oscillator wave type
osc.type = 'sawtooth';

// Set up node routing
osc.connect(masterVolume);
masterVolume.connect(context.destination);

// Change volume and frequency according to data
var timepoint = startTime;
for(var i = 0; i<data.length; i++) {
    // Linear interpolation (line graph)
    masterVolume.gain.linearRampToValueAtTime(volumes[i], timepoint);
    // Frequency adjustment
    osc.frequency.linearRampToValueAtTime(frequencies[i], timepoint);
    timepoint = timepoint + interval;
};

// Fade out
masterVolume.gain.setValueAtTime(0.1, startTime + duration - 0.1);
masterVolume.gain.linearRampToValueAtTime(0, startTime + duration);

// Start oscillator
osc.start(startTime);