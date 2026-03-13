import { useState } from 'react';
import { useIntentContext } from '../contexts/IntentContext';

export default function VideoPanel() {
  const { workspace } = useIntentContext();
  const video = workspace?.video;
  const suggestions = video?.suggestions || [];

  // The currently selected video (default to first)
  const [activeIdx, setActiveIdx] = useState(0);

  const active = suggestions[activeIdx] || (video?.videoId
    ? {
        videoId: video.videoId,
        embedUrl: video.embedUrl || `https://www.youtube.com/embed/${video.videoId}`,
        title: video.title || 'Study Video',
        author: '',
        duration: '',
        views: '',
        thumbnail: `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`,
      }
    : null);

  const searchQuery = video?.youtubeSearch || video?.title || workspace?.topic;

  return (
    <div className="bg-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl p-5 hover:scale-[1.01] transition duration-300 border border-slate-700 flex flex-col gap-4 text-left">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl bg-red-500/20 p-2 rounded-lg text-red-400">🎬</span>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-slate-100 tracking-wide">Study Videos</h2>
          {searchQuery && (
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              <span className="text-slate-500">Topic: </span>
              <span className="text-indigo-300">{searchQuery}</span>
            </p>
          )}
        </div>
        {active?.videoId && (
          <a
            href={`https://www.youtube.com/watch?v=${active.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            YouTube ↗
          </a>
        )}
      </div>

      {/* Main Player */}
      {active ? (
        <div className="w-full rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950">
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <iframe
              key={active.videoId}
              src={active.embedUrl}
              title={active.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
          {/* Now playing bar */}
          <div className="px-3 py-2 bg-slate-900/80 border-t border-slate-800">
            <p className="text-xs text-slate-300 font-medium truncate">{active.title}</p>
            <div className="flex gap-2 mt-0.5 text-[10px] text-slate-500">
              {active.author && <span>{active.author}</span>}
              {active.duration && <span>· {active.duration}</span>}
              {active.views && <span>· {active.views}</span>}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center p-8">
          <p className="text-slate-500 text-sm">
            {workspace ? 'Fetching videos for your topic…' : 'No videos loaded yet.'}
          </p>
        </div>
      )}

      {/* Video Suggestions Carousel */}
      {suggestions.length > 1 && (
        <div>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-2 font-semibold">
            More Videos
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
            {suggestions.map((vid, idx) => (
              <button
                key={vid.videoId}
                onClick={() => setActiveIdx(idx)}
                className={`flex-shrink-0 w-44 rounded-lg border overflow-hidden text-left transition group ${
                  idx === activeIdx
                    ? 'border-indigo-500 ring-1 ring-indigo-500/40'
                    : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                  <img
                    src={vid.thumbnail || `https://img.youtube.com/vi/${vid.videoId}/mqdefault.jpg`}
                    alt={vid.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = `https://img.youtube.com/vi/${vid.videoId}/mqdefault.jpg`;
                    }}
                  />
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
                    <span className="text-white text-2xl">▶</span>
                  </div>
                  {/* Duration badge */}
                  {vid.duration && (
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">
                      {vid.duration}
                    </span>
                  )}
                  {/* Active indicator */}
                  {idx === activeIdx && (
                    <div className="absolute top-1 left-1 bg-indigo-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                      PLAYING
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-2 bg-slate-900">
                  <p className="text-[11px] text-slate-200 font-medium line-clamp-2 leading-tight">
                    {vid.title}
                  </p>
                  {vid.author && (
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{vid.author}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
