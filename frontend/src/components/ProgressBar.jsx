import React from 'react';
import { useMusic } from '../context/MusicContext';

const ProgressBar = () => {
  const { currentTime, duration, seekTo, formatTime } = useMusic();

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    seekTo(time);
  };

  const calculateProgress = () => {
    if (!duration) return 0;
    return (currentTime / duration) * 100;
  };

  // Standard CSS for the slider thumb since Vite doesn't support <style jsx> by default
  const sliderThumbStyle = {
    '--thumb-color': '#a855f7',
    '--thumb-size': '12px',
  };

  return (
    <div className="w-full flex flex-col gap-1 px-4">
      <div className="relative w-full h-1.5 group flex items-center">
        {/* Progress Fill Background Layer */}
        <div className="absolute inset-0 bg-white/10 rounded-full" />
        
        {/* Actual Progress Fill */}
        <div 
          className="absolute inset-y-0 left-0 bg-purple-500 rounded-full pointer-events-none"
          style={{ width: `${calculateProgress()}%` }}
        />

        {/* Transparent Range Input for Interaction */}
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="absolute w-full h-full appearance-none bg-transparent cursor-pointer outline-none z-10"
          style={sliderThumbStyle}
        />
        
        {/* CSS for Thumb Styling in standard CSS */}
        <style dangerouslySetInnerHTML={{ __html: `
          input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 12px;
            height: 12px;
            background: #fff;
            border: 2px solid #a855f7;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(168, 85, 247, 0.4);
            margin-top: -5px; /* Centers thumb on the track */
            opacity: 0;
            transition: opacity 0.2s;
          }
          .group:hover input[type='range']::-webkit-slider-thumb {
            opacity: 1;
          }
          input[type='range']::-moz-range-thumb {
            width: 12px;
            height: 12px;
            background: #fff;
            border: 2px solid #a855f7;
            border-radius: 50%;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s;
          }
          .group:hover input[type='range']::-moz-range-thumb {
            opacity: 1;
          }
        `}} />
      </div>

      <div className="flex justify-between text-[10px] text-gray-400 font-medium tracking-tighter">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
