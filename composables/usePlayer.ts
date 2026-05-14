import { useState } from '#app';

export interface AudioTrack {
    id: string;
    title: string;
    cover?: string;
    source: string;
}

export const usePlayer = () => {
    const currentTrack = useState<AudioTrack | null>('player_current_track', () => null);
    const playlist = useState<AudioTrack[]>('player_playlist', () => []);
    const isPlaying = useState<boolean>('player_is_playing', () => false);

    const setTrack = (track: AudioTrack, list: AudioTrack[] = []) => {
        currentTrack.value = track;
        if (list.length > 0) {
            playlist.value = list;
        } else if (!playlist.value.some(t => t.id === track.id)) {
            playlist.value = [track];
        }
        isPlaying.value = true;
    };

    const togglePlay = () => {
        if (!currentTrack.value) return;
        isPlaying.value = !isPlaying.value;
    };

    const nextTrack = () => {
        if (playlist.value.length === 0 || !currentTrack.value) return;
        const idx = playlist.value.findIndex(t => t.id === currentTrack.value?.id);
        const nextIdx = (idx + 1) % playlist.value.length;
        currentTrack.value = playlist.value[nextIdx] || null;
        isPlaying.value = true;
    };

    const prevTrack = () => {
        if (playlist.value.length === 0 || !currentTrack.value) return;
        const idx = playlist.value.findIndex(t => t.id === currentTrack.value?.id);
        const prevIdx = (idx - 1 + playlist.value.length) % playlist.value.length;
        currentTrack.value = playlist.value[prevIdx] || null;
        isPlaying.value = true;
    };

    const stop = () => {
        isPlaying.value = false;
        currentTrack.value = null;
        playlist.value = [];
    };

    const updatePlaylistOnly = (list: AudioTrack[]) => {
        playlist.value = list;
    };

    return {
        currentTrack,
        playlist,
        isPlaying,
        setTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        stop,
        updatePlaylistOnly,
    };
};
