/**
 * Created by David on 07/05/2016.
 */

var data = [5, 7, 1, 10, 11, 20, 15, 1, 20],
    context = new AudioContext(),
    masterVolume = context.createGain(),
    startTime = context.currentTime,
    frequency = 493.883, // 'B' note
    duration = 1;

// for(var i=0; i<10; i++) data.push(i);
// for(var i=10; i>0; i--) data.push(i);

var maxvol = 0.3,
    minvol = 0.01;

// Scale data (domain) to volume interval (range)
var linearScale = function(x) { // What about logarithmic?
    var a = Math.min.apply(null, data);
    var b = Math.max.apply(null, data);
    var c = minvol;
    var d = maxvol;
    return(c*(x-a)/(b-a) + d*(x-a)/(b-a));
};

var lengthOfClip = 10;

var interval = lengthOfClip/data.length;
volumes = [];
for(var i=0; i<data.length; i++) {
    volumes.push(linearScale(data[i]));
};

// Set the volume not too loud
masterVolume.gain.value = 0.1;

// Create wave oscillators
var osc = context.createOscillator();

// Set oscillator wave type
osc.type = 'sawtooth';

// Set up node routing
osc.connect(masterVolume);
masterVolume.connect(context.destination);

// Detune oscillators for chorus effect
// osc1.frequency.value = frequency + data['counts'][0]/2;
// osc2.frequency.value = frequency + data['counts'][1]/2;

// Change volume according to data
var timepoint = startTime;
for(var i = 0; i<data.length; i++) {
    console.log(volumes[i]);
    // Discrete jumps
    //masterVolume.gain.setValueAtTime(volumes[i], timepoint);
    // Linear interpolation (line graph)
    masterVolume.gain.linearRampToValueAtTime(volumes[i], timepoint);
    timepoint = timepoint + interval;
};

// Fade out
masterVolume.gain.setValueAtTime(0.1, startTime + lengthOfClip - 0.1);
masterVolume.gain.linearRampToValueAtTime(0, startTime + lengthOfClip);

// Start oscillator
osc.start(startTime);