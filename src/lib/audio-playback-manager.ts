/**
 * Global Audio Playback Manager
 * Ensures only one audio player is active at a time
 * Each player registers with this manager and can stop all others
 */

type PlaybackController = {
  id: string;
  stop: () => void;
};

class AudioPlaybackManager {
  private activePlayer: PlaybackController | null = null;
  private registeredPlayers: Map<string, PlaybackController> = new Map();

  /**
   * Register a player with the manager
   */
  register(id: string, stopCallback: () => void): void {
    this.registeredPlayers.set(id, { id, stop: stopCallback });
    console.log(`🎵 AudioPlaybackManager: Registered player "${id}"`);
  }

  /**
   * Unregister a player (when component unmounts)
   */
  unregister(id: string): void {
    this.registeredPlayers.delete(id);
    if (this.activePlayer?.id === id) {
      this.activePlayer = null;
    }
    console.log(`🎵 AudioPlaybackManager: Unregistered player "${id}"`);
  }

  /**
   * Notify that a player wants to start
   * This will stop all other players
   */
  requestPlayback(id: string): void {
    console.log(`🎵 AudioPlaybackManager: Player "${id}" requesting playback`);
    
    // Stop the currently active player if it's different
    if (this.activePlayer && this.activePlayer.id !== id) {
      console.log(`🎵 AudioPlaybackManager: Stopping previous player "${this.activePlayer.id}"`);
      this.activePlayer.stop();
    }

    // Set this player as active
    const player = this.registeredPlayers.get(id);
    if (player) {
      this.activePlayer = player;
      console.log(`🎵 AudioPlaybackManager: Player "${id}" is now active`);
    }
  }

  /**
   * Notify that a player has stopped
   */
  notifyStopped(id: string): void {
    if (this.activePlayer?.id === id) {
      this.activePlayer = null;
      console.log(`🎵 AudioPlaybackManager: Player "${id}" stopped, no active player`);
    }
  }

  /**
   * Stop all players
   */
  stopAll(): void {
    console.log(`🎵 AudioPlaybackManager: Stopping all players`);
    this.registeredPlayers.forEach((player) => {
      player.stop();
    });
    this.activePlayer = null;
  }

  /**
   * Get the currently active player ID
   */
  getActivePlayerId(): string | null {
    return this.activePlayer?.id || null;
  }
}

// Singleton instance
export const audioPlaybackManager = new AudioPlaybackManager();
