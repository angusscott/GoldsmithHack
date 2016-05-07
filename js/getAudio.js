(function () {
    var audio = new Audio();

    function searchTracks(query) {
        $.ajax({
            url: 'https://api.spotify.com/v1/search',
            data: {
                q: query,
                type: 'track'
            },
            success: function (response) {
                if (response.tracks.items.length) {
                    var track = response.tracks.items[0];
                    var previewUrl = track.preview_url;
                    audio.src = track.preview_url;
                    var context = new (window.AudioContext || window.webkitAudioContext) ();
                    var request = new XMLHttpRequest();
                    request.open('GET', previewUrl, true);
                    request.responseType = 'arraybuffer';
                    request.onload = function() {
                        // Create offline context
                        var OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
                        var offlineContext = new OfflineContext(1, 2, 44100);

                        offlineContext.decodeAudioData(request.response, function(buffer) {

                            // Create buffer source
                            var source = offlineContext.createBufferSource();
                            source.buffer = buffer;

                            // Create filter
                            var filter = offlineContext.createBiquadFilter();
                            filter.type = "lowpass";

                            // Pipe the song into the filter, and the filter into the offline context
                            //filter.connect(offlineContext.destination);
                            source.connect(offlineContext.destination);
                            console.log(source)
                            source.start(offlineContext.currentTime);

                        });
                    }
                    request.send();
                }
            }
        });
    }

    function playSong(songName, artistName) {
        var query = songName;
        if (artistName) {
            query += ' artist:' + artistName;
        }

        searchTracks(query);
    }

    $( "#playmusic" ).click(function() {
        playSong("Sandstorm", "Darude");
    });

})();