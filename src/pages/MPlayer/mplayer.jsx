import React, { useState, useEffect, useRef } from 'react';
import './mplayer.css';

function MPlayer() {
  const [activeTab, setActiveTab] = useState('player');
  const [playlist, setPlaylist] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [repeat, setRepeat] = useState('none'); // none, one, all
  const [shuffle, setShuffle] = useState(false);
  const audioRef = useRef(null);

  // Load playlist from localStorage
  useEffect(() => {
    const savedPlaylist = localStorage.getItem('mplayer_playlist');
    if (savedPlaylist) {
      setPlaylist(JSON.parse(savedPlaylist));
    } else {
      // Default demo playlist
      const demoPlaylist = [
        {
          id: 1,
          title: 'Summer Vibes',
          artist: 'DJ Cool',
          duration: '3:45',
          url: '',
          album: 'Chill Mix'
        },
        {
          id: 2,
          title: 'Night Drive',
          artist: 'Electronic Dreams',
          duration: '4:20',
          url: '',
          album: 'Midnight'
        },
        {
          id: 3,
          title: 'Coffee Shop Jazz',
          artist: 'Jazz Ensemble',
          duration: '5:12',
          url: '',
          album: 'Relaxation'
        }
      ];
      setPlaylist(demoPlaylist);
      localStorage.setItem('mplayer_playlist', JSON.stringify(demoPlaylist));
    }
  }, []);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeat === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if (repeat === 'all' || shuffle) {
        playNext();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeat, shuffle]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    // Note: In a real app, you would set audioRef.current.src = track.url
    // For demo purposes, we're simulating playback
  };

  const togglePlay = () => {
    if (!currentTrack) {
      if (playlist.length > 0) {
        playTrack(playlist[0]);
      }
      return;
    }
    
    setIsPlaying(!isPlaying);
    // In a real app: audioRef.current[isPlaying ? 'pause' : 'play']();
  };

  const playNext = () => {
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    let nextIndex;
    
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    
    playTrack(playlist[nextIndex]);
  };

  const playPrevious = () => {
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    
    playTrack(playlist[prevIndex]);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const addToPlaylist = () => {
    const title = prompt('Enter song title:');
    if (!title) return;
    
    const artist = prompt('Enter artist name:');
    if (!artist) return;
    
    const newTrack = {
      id: Date.now(),
      title,
      artist,
      duration: '0:00',
      url: '',
      album: 'Unknown'
    };
    
    const updatedPlaylist = [...playlist, newTrack];
    setPlaylist(updatedPlaylist);
    localStorage.setItem('mplayer_playlist', JSON.stringify(updatedPlaylist));
  };

  const removeFromPlaylist = (id) => {
    const updatedPlaylist = playlist.filter(t => t.id !== id);
    setPlaylist(updatedPlaylist);
    localStorage.setItem('mplayer_playlist', JSON.stringify(updatedPlaylist));
    
    if (currentTrack && currentTrack.id === id) {
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };

  const toggleRepeat = () => {
    const modes = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeat);
    setRepeat(modes[(currentIndex + 1) % modes.length]);
  };

  const getRepeatIcon = () => {
    if (repeat === 'one') return '🔂';
    if (repeat === 'all') return '🔁';
    return '↻';
  };

  return (
    <div className="mplayer-container">
      <audio ref={audioRef} />
      
      <div className="mplayer-header">
        <h2>🎵 MPlayer</h2>
        <div className="mplayer-tabs">
          <button 
            className={activeTab === 'player' ? 'tab-active' : ''}
            onClick={() => setActiveTab('player')}
          >
            Now Playing
          </button>
          <button 
            className={activeTab === 'playlist' ? 'tab-active' : ''}
            onClick={() => setActiveTab('playlist')}
          >
            Playlist
          </button>
        </div>
      </div>

      <div className="mplayer-content">
        {activeTab === 'player' && (
          <div className="player-panel">
            <div className="album-art">
              {currentTrack ? (
                <div className="album-cover">
                  <div className="vinyl-disc" style={{ 
                    animation: isPlaying ? 'spin 3s linear infinite' : 'none' 
                  }}>
                    💿
                  </div>
                </div>
              ) : (
                <div className="no-track">
                  <span>🎵</span>
                  <p>No track selected</p>
                </div>
              )}
            </div>

            {currentTrack && (
              <div className="track-info">
                <h3>{currentTrack.title}</h3>
                <p className="artist">{currentTrack.artist}</p>
                <p className="album">{currentTrack.album}</p>
              </div>
            )}

            <div className="player-controls">
              <div className="progress-bar">
                <span className="time-current">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="seek-bar"
                />
                <span className="time-duration">{formatTime(duration)}</span>
              </div>

              <div className="control-buttons">
                <button 
                  className="control-btn"
                  onClick={() => setShuffle(!shuffle)}
                  style={{ color: shuffle ? '#8b5cf6' : '#94a3b8' }}
                  title="Shuffle"
                >
                  🔀
                </button>
                <button className="control-btn" onClick={playPrevious}>
                  ⏮️
                </button>
                <button className="play-btn" onClick={togglePlay}>
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
                <button className="control-btn" onClick={playNext}>
                  ⏭️
                </button>
                <button 
                  className="control-btn"
                  onClick={toggleRepeat}
                  style={{ color: repeat !== 'none' ? '#8b5cf6' : '#94a3b8' }}
                  title={`Repeat: ${repeat}`}
                >
                  {getRepeatIcon()}
                </button>
              </div>

              <div className="volume-control">
                <span>🔊</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="volume-bar"
                />
                <span className="volume-value">{volume}%</span>
              </div>
            </div>

            {playlist.length > 0 && (
              <div className="up-next">
                <h4>Up Next</h4>
                <div className="next-tracks">
                  {playlist.slice(0, 3).map((track) => (
                    <div 
                      key={track.id} 
                      className={`next-track ${currentTrack && currentTrack.id === track.id ? 'active' : ''}`}
                      onClick={() => playTrack(track)}
                    >
                      <span className="track-number">♪</span>
                      <div className="next-track-info">
                        <p className="next-title">{track.title}</p>
                        <p className="next-artist">{track.artist}</p>
                      </div>
                      <span className="next-duration">{track.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'playlist' && (
          <div className="playlist-panel">
            <div className="playlist-header">
              <h3>My Playlist ({playlist.length} tracks)</h3>
              <button className="add-track-btn" onClick={addToPlaylist}>
                ➕ Add Track
              </button>
            </div>

            <div className="playlist-list">
              {playlist.length === 0 ? (
                <p className="empty-message">Your playlist is empty. Add some tracks!</p>
              ) : (
                playlist.map((track, index) => (
                  <div 
                    key={track.id} 
                    className={`playlist-item ${currentTrack && currentTrack.id === track.id ? 'playing' : ''}`}
                  >
                    <span className="track-number">{index + 1}</span>
                    <div className="track-details" onClick={() => playTrack(track)}>
                      <h4>{track.title}</h4>
                      <p>{track.artist} • {track.album}</p>
                    </div>
                    <span className="track-duration">{track.duration}</span>
                    <div className="track-actions">
                      <button 
                        className="play-track-btn"
                        onClick={() => playTrack(track)}
                      >
                        {currentTrack && currentTrack.id === track.id && isPlaying ? '⏸️' : '▶️'}
                      </button>
                      <button 
                        className="remove-track-btn"
                        onClick={() => removeFromPlaylist(track.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MPlayer;
