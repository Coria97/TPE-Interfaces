// audio-manager.js - Sistema de gestión de audio

export default class AudioManager {
  constructor() {
    this.sounds = {};
    this.currentMusic = null;
    this.musicVolume = 0.5; // Volumen de la música
    this.sfxVolume = 0.7; // Volumen de efectos de sonido
    this.isMuted = false;
    
    // Obtener la ruta base correcta
    this.basePath = this.getBasePath();
    
    this.loadSounds();
  }

  getBasePath() {
    // Obtener la ruta base del proyecto
    const path = window.location.pathname;
    const base = path.substring(0, path.lastIndexOf('/'));
    return base || '.';
  }

  loadSounds() {
    // Cargar música
    this.sounds.gameStart = this.createAudio(`${this.basePath}/assets/flappy-bird/audio/game-start.mp3`, this.musicVolume);
    this.sounds.gameLoop = this.createAudio(`${this.basePath}/assets/flappy-bird/audio/game-loop.mp3`, this.musicVolume);
    this.sounds.gameEnd = this.createAudio(`${this.basePath}/assets/flappy-bird/audio/game-end.mp3`, this.musicVolume);
    
    // Cargar efectos de sonido (SFX)
    this.sounds.fxDamage = this.createAudio(`${this.basePath}/assets/flappy-bird/audio/fxDMG.wav`, this.sfxVolume);
    this.sounds.fxLifeUp = this.createAudio(`${this.basePath}/assets/flappy-bird/audio/fxUP.wav`, this.sfxVolume);
    
    // La música se reproduce en loop
    this.sounds.gameLoop.loop = true;
  }

  createAudio(src, volume) {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.preload = 'auto';
    
    // Manejar errores de carga
    audio.addEventListener('error', (e) => {
      console.warn(`No se pudo cargar el audio: ${src}`, e);
    });
    
    return audio;
  }

  playGameStart() {
    // Reproducir música de inicio
    this.stopAll();
    this.playMusic('gameStart');
    
    // Cuando termine, iniciar el loop automáticamente
    this.sounds.gameStart.addEventListener('ended', () => {
      this.playGameLoop();
    }, { once: true });
  }

  playGameLoop() {
    // Reproducir música de juego (loop)
    this.stopAll();
    this.playMusic('gameLoop');
  }

  playGameEnd() {
    // Reproducir música de game over
    this.stopAll();
    this.playMusic('gameEnd');
  }

  playSFX(soundName) {
    // Reproducir efecto de sonido
    if (this.isMuted) return;
    
    const sound = this.sounds[soundName];
    if (!sound) {
      console.warn(`Efecto de sonido no encontrado: ${soundName}`);
      return;
    }
    
    // Los efectos pueden solaparse, así que clonamos el audio
    const sfxClone = sound.cloneNode();
    sfxClone.volume = this.sfxVolume;
    sfxClone.play().catch(error => {
      console.warn('No se pudo reproducir el efecto de sonido:', error);
    });
  }

  playDamageSound() {
    // Reproducir sonido de daño
    this.playSFX('fxDamage');
  }

  playLifeUpSound() {
    // Reproducir sonido de ganar vida
    this.playSFX('fxLifeUp');
  }

  playMusic(soundName) {
    if (this.isMuted) return;
    
    const sound = this.sounds[soundName];
    if (!sound) {
      console.warn(`Sonido no encontrado: ${soundName}`);
      return;
    }
    
    this.currentMusic = sound;
    
    // Resetear y reproducir
    sound.currentTime = 0;
    const playPromise = sound.play();
    
    // Manejar promesa de reproducción
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('No se pudo reproducir el audio automáticamente:', error);
      });
    }
  }

  stopAll() {
    // Detener toda la música
    Object.values(this.sounds).forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
  }

  pause() {
    // Pausar música actual
    if (this.currentMusic) {
      this.currentMusic.pause();
    }
  }

  resume() {
    // Reanudar música actual
    if (this.currentMusic && !this.isMuted) {
      this.currentMusic.play();
    }
  }

  setMusicVolume(volume) {
    // Ajustar volumen de la música (0.0 - 1.0)
    this.musicVolume = Math.max(0, Math.min(1, volume));
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.musicVolume;
    });
  }

  setSFXVolume(volume) {
    // Ajustar volumen de efectos de sonido (0.0 - 1.0)
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  toggleMute() {
    // Alternar mute
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      this.pause();
    } else {
      this.resume();
    }
    
    return this.isMuted;
  }

  destroy() {
    // Limpiar recursos de audio
    this.stopAll();
    Object.values(this.sounds).forEach(sound => {
      sound.src = '';
    });
    this.sounds = {};
    this.currentMusic = null;
  }
}
