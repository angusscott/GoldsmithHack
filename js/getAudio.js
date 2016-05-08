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
                        var undecodedAudio = request.response;
                        context.decodeAudioData(undecodedAudio, function (buffer) {
                            var sourceBuffer = context.createBufferSource();
                            sourceBuffer.buffer = buffer;
                            sourceBuffer.connect(context.destination);
                            sourceBuffer.start(context.currentTime);
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

    $( "#randomise" ).click(function() {
        playSong("Sandstorm", "Darude");
    });

    $("#playmusic").click(function () {
        var track = $("#inputTrack").val()
        var artist = $("#inputArtist").val()
        playSong(track, artist);
    });

})();