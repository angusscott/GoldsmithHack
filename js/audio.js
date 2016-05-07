/**
 * Created by David on 07/05/2016.
 */

var data = [5, 7, 1, 10, 11, 20, 15, 1, 20],
    context = new AudioContext(),
    masterVolume = context.createGain(),
    startTime = context.currentTime,
    pitchBender = context.createBiquadFilter(),
    frequency = 493.883, // 'B' note
    duration = 10;

var maxvol = 0.3,
    minvol = 0.1,
    minfreq = frequency-3,
    maxfreq = frequency+3;

// Scale data (domain) to volume interval (range)
var linearScale = function(x, range0, range1) {
    var a = Math.min(Math.min.apply(null, data), 0);
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
masterVolume.gain.value = 0.3;

// Create wave oscillator
var osc = context.createOscillator();

// Load an external file
var request = new XMLHttpRequest();
request.open('GET', 'myfile.mp3', true);
request.responseType = 'arraybuffer';

request.onload = function() {
    var undecodedAudio = request.response;

    context.decodeAudioData(undecodedAudio, function(buffer) {
        // the contents of our mp3 is now an AudioBuffer
        console.log(buffer);

        // Create the AudioBufferSourceNode
        var sourceBuffer = context.createBufferSource();

        // Tell the AudioBufferSourceNode to use this AudioBuffer.
        sourceBuffer.buffer = buffer;

        // Connect to the speakers, via gain (volume) controller
        sourceBuffer.connect(masterVolume);
        masterVolume.connect(pitchBender);
        pitchBender.connect(context.destination);

        // Fade out after 10 seconds
        masterVolume.gain.linearRampToValueAtTime(0.5, startTime+10);

        // Bend it like Beckham
        pitchBender.type = "allpass"; // doesn't do anything
        sourceBuffer.playbackRate.value = 3.6;

        // Start playing now
        sourceBuffer.start(startTime);
        //sourceBuffer.stop(context.currentTime+10);
    });
};
request.send();

debugger;


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

// Start and stop oscillator
osc.start(startTime);