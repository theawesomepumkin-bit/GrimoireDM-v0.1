import React, { useState } from 'react';
import { audioEngine } from '../../utils/audioEngine.ts';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Repeat,
  Upload,
  Radio,
  Flame,
  CloudRain,
  Skull,
  Trees,
  Dices,
  Swords,
  Sparkles,
  HeartHandshake,
  ShieldAlert,
  Zap,
  Wine,
  Megaphone,
  Shield,
  EyeOff
} from 'lucide-react';

interface CustomAudioSlot {
  id: string;
  label: string;
  url: string;
}

export const SoundboardHub: React.FC = () => {
  // Ambient State
  const [ambientPlaying, setAmbientPlaying] = useState<string | null>(null);
  const [ambientVolume, setAmbientVolume] = useState<number>(0.6);
  const [sfxVolume, setSfxVolume] = useState<number>(0.8);
  const [loopAmbient, setLoopAmbient] = useState<boolean>(true);
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [customAmbients, setCustomAmbients] = useState<CustomAudioSlot[]>([]);
  const [activePadAnimation, setActivePadAnimation] = useState<string | null>(null);

  const ambientTracks = [
    { id: 'tavern', label: 'Cozy Tavern Hearth', desc: 'Crackling hearth & warm amber murmur', icon: Flame },
    { id: 'rain', label: 'Rainstorm & Thunder', desc: 'Continuous rainfall with distant thunder', icon: CloudRain },
    { id: 'dungeon', label: 'Dungeon Catacomb Drone', desc: 'Deep subterranean echoing resonance', icon: Skull },
    { id: 'forest', label: 'Whispering Wilds', desc: 'Canopy winds and mystical rustle', icon: Trees },
  ];

  const sfxPads = [
    { id: 'dice', label: 'Dice Roll (d20)', icon: Dices, soundType: 'dice' },
    { id: 'sword', label: 'Weapon Impact', icon: Swords, soundType: 'sword' },
    { id: 'magic', label: 'Fireball / Blast', icon: Sparkles, soundType: 'magic' },
    { id: 'heal', label: 'Healing Chime', icon: HeartHandshake, soundType: 'heal' },
    { id: 'roar', label: 'Monster Roar', icon: ShieldAlert, soundType: 'roar' },
    { id: 'thunder', label: 'Thunderstrike', icon: Zap, soundType: 'thunder' },
    { id: 'tavern', label: 'Mug Clink Toast', icon: Wine, soundType: 'tavern' },
    { id: 'horn', label: 'War Horn Blast', icon: Megaphone, soundType: 'horn' },
    { id: 'shield', label: 'Shield Bash', icon: Shield, soundType: 'shield' },
    { id: 'whisper', label: 'Eerie Whisper', icon: EyeOff, soundType: 'whisper' },
  ];

  const handleToggleAmbient = (trackId: string, customUrl?: string) => {
    if (ambientPlaying === trackId) {
      audioEngine.stopAmbient(true);
      setAmbientPlaying(null);
    } else {
      audioEngine.startAmbient(trackId as any, customUrl);
      setAmbientPlaying(trackId);
    }
  };

  const handleTriggerSfx = (soundType: string, padId: string) => {
    audioEngine.playSfx(soundType);
    setActivePadAnimation(padId);
    setTimeout(() => {
      setActivePadAnimation((current) => (current === padId ? null : current));
    }, 250);
  };

  const handleAmbientVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAmbientVolume(val);
    audioEngine.setAmbientVolume(val);
  };

  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSfxVolume(val);
    audioEngine.setSfxVolume(val);
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newSlot: CustomAudioSlot = {
        id: `custom_${Date.now()}`,
        label: file.name.replace(/\.[^/.]+$/, '').slice(0, 20),
        url,
      };
      setCustomAmbients(prev => [...prev, newSlot]);
    }
  };

  const handleAddStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamUrl.trim()) return;
    const newSlot: CustomAudioSlot = {
      id: `stream_${Date.now()}`,
      label: 'Web Audio Stream',
      url: streamUrl.trim(),
    };
    setCustomAmbients(prev => [...prev, newSlot]);
    setStreamUrl('');
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-6">
      {/* 1. Ambient Music Player */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-500 font-fantasy">
              Ambient Soundscapes & Music Player
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Ambient Volume Slider */}
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={handleAmbientVolumeChange}
                aria-label="Ambient volume"
                className="w-20 h-1.5 accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] font-mono-numbers text-slate-400 w-8">
                {Math.round(ambientVolume * 100)}%
              </span>
            </div>

            {/* Loop Toggle */}
            <button
              onClick={() => setLoopAmbient(!loopAmbient)}
              title="Toggle Looping"
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                loopAmbient
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                  : 'border-slate-800 text-slate-500'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ambient Track Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {ambientTracks.map((track) => {
            const isCurrent = ambientPlaying === track.id;
            const Icon = track.icon;
            return (
              <button
                key={track.id}
                onClick={() => handleToggleAmbient(track.id)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-24 ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/10'
                    : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/40 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isCurrent ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCurrent ? <Square className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2.5 h-2.5 ml-0.5" />}
                  </span>
                </div>
                <div>
                  <div className={`text-xs font-semibold ${isCurrent ? 'text-amber-300' : 'text-slate-200'}`}>
                    {track.label}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{track.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom audio upload & stream input */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/50">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 text-xs cursor-pointer border border-slate-700/60">
            <Upload className="w-3.5 h-3.5 text-amber-500" />
            <span>Upload Audio File</span>
            <input type="file" accept="audio/*" onChange={handleCustomFileUpload} className="hidden" />
          </label>

          <form onSubmit={handleAddStream} className="flex-1 flex items-center gap-2 min-w-[200px]">
            <input
              type="url"
              placeholder="Or enter streaming audio URL (.mp3 / .ogg)..."
              value={streamUrl}
              onChange={e => setStreamUrl(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500 select-text"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700"
            >
              Add Stream
            </button>
          </form>

          {/* Custom audio items list */}
          {customAmbients.length > 0 && (
            <div className="w-full flex items-center gap-2 overflow-x-auto pt-1 no-scrollbar">
              {customAmbients.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleToggleAmbient(c.id, c.url)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border ${
                    ambientPlaying === c.id
                      ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <Play className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">{c.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Tactical SFX Soundboard */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-500 font-fantasy">
              Tactical SFX Soundboard
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVolume}
              onChange={handleSfxVolumeChange}
              aria-label="SFX volume"
              className="w-20 h-1.5 accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] font-mono-numbers text-slate-400 w-8">
              {Math.round(sfxVolume * 100)}%
            </span>
          </div>
        </div>

        {/* SFX Pad Grid (optimized for touch on iPad) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {sfxPads.map((pad) => {
            const Icon = pad.icon;
            const isPressed = activePadAnimation === pad.id;
            return (
              <button
                key={pad.id}
                onClick={() => handleTriggerSfx(pad.soundType, pad.id)}
                className={`min-h-[58px] p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 touch-manipulation select-none ${
                  isPressed
                    ? 'border-amber-400 bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                    : 'border-slate-800 bg-slate-950/70 hover:bg-slate-800/60 hover:border-slate-700 text-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isPressed ? 'text-slate-950' : 'text-amber-400'}`} />
                <span className="text-xs font-medium text-center leading-tight whitespace-nowrap">
                  {pad.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
