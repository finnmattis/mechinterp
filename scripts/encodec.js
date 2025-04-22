document.addEventListener("DOMContentLoaded", function () {
  const albumCover = document.querySelector(".album-cover");
  const songTitle = document.querySelector(".song-title");
  const songArtist = document.querySelector(".song-artist");
  const audioStatus = document.querySelector(".audio-status");
  const audioPlayer = document.getElementById("audio-player");
  const playButton = document.querySelector(".play-button");
  const playIcon = document.getElementById("play-icon");
  const pauseIcon = document.getElementById("pause-icon");
  const prevButton = document.querySelector(".prev-button");
  const nextButton = document.querySelector(".next-button");
  const compressionToggle = document.querySelector(".compression-toggle");
  const toggleLeft = document.getElementById("toggle-left");
  const toggleRight = document.getElementById("toggle-right");
  const toggleText = document.getElementById("toggle-text");

  let currentSongIndex = 0;
  let isPlaying = false;
  let isCompressed = false;

  const songs = [
    {
      title: "Sonata No. 4",
      artist: "Alexander Scriabin (Ashkenazy)",
      filename: "scriabin",
      coverArt: "scriabin_art.jpg",
    },
    {
      title: "The Great Gig in the Sky",
      artist: "Pink Floyd",
      filename: "gig",
      coverArt: "gig_art.webp",
    },
    {
      title: "Untitled 05",
      artist: "Kendrick Lamar",
      filename: "untitled",
      coverArt: "untitled_art.jpg",
    },
    {
      title: "Blinding Lights",
      artist: "The Weeknd",
      filename: "lights",
      coverArt: "lights_art.webp",
    },
  ];

  function updatePlayer() {
    const song = songs[currentSongIndex];

    albumCover.style.backgroundImage = `url(media/${song.coverArt})`;

    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    audioStatus.textContent = isCompressed
      ? "Compressed Audio"
      : "Original Audio";

    const suffix = isCompressed ? "_comp.wav" : ".wav";
    audioPlayer.src = `media/${song.filename}${suffix}`;

    if (isPlaying) {
      audioPlayer.play().catch((e) => console.error("Playback failed:", e));
    }
  }

  function togglePlay() {
    if (isPlaying) {
      audioPlayer.pause();
      playIcon.style.display = "block";
      pauseIcon.style.display = "none";
    } else {
      audioPlayer.play().catch((e) => console.error("Playback failed:", e));
      playIcon.style.display = "none";
      pauseIcon.style.display = "block";
    }
    isPlaying = !isPlaying;
  }

  function toggleCompression() {
    const wasPlaying = isPlaying;
    const currentTime = audioPlayer.currentTime;

    isCompressed = !isCompressed;

    if (isCompressed) {
      toggleLeft.style.display = "none";
      toggleRight.style.display = "block";
      toggleText.textContent = "Compressed";
    } else {
      toggleLeft.style.display = "block";
      toggleRight.style.display = "none";
      toggleText.textContent = "Original";
    }

    if (wasPlaying) {
      audioPlayer.pause();
    }

    const song = songs[currentSongIndex];
    const suffix = isCompressed ? "_comp.wav" : ".wav";
    audioPlayer.src = `media/${song.filename}${suffix}`;

    audioStatus.textContent = isCompressed
      ? "Compressed Audio"
      : "Original Audio";

    audioPlayer.addEventListener("canplaythrough", function onCanPlay() {
      audioPlayer.currentTime = currentTime;

      if (wasPlaying) {
        audioPlayer
          .play()
          .then(() => {
            playIcon.style.display = "none";
            pauseIcon.style.display = "block";
          })
          .catch((e) => console.error("Failed to resume playback:", e));
      }

      audioPlayer.removeEventListener("canplaythrough", onCanPlay);
    });
  }

  function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    updatePlayer();
  }

  function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    updatePlayer();
  }

  playButton.addEventListener("click", togglePlay);
  compressionToggle.addEventListener("click", toggleCompression);
  prevButton.addEventListener("click", prevSong);
  nextButton.addEventListener("click", nextSong);
  audioPlayer.addEventListener("ended", function () {
    isPlaying = false;
    playIcon.style.display = "block";
    pauseIcon.style.display = "none";
  });

  updatePlayer();
});
