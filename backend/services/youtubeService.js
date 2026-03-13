/**
 * youtubeService.js
 * Uses yt-search to find real YouTube videos for a given search query.
 * No API key required.
 */
const ytSearch = require('yt-search');

/**
 * Search YouTube and return the top N videos found.
 * @param {string} query - e.g. "react hooks tutorial for beginners"
 * @param {number} limit - number of results to return (default: 5)
 * @returns {Promise<Array<{videoId: string, title: string, thumbnail: string, duration: string, views: string, author: string, embedUrl: string}>>}
 */
const searchYouTube = async (query, limit = 5) => {
  try {
    const result = await ytSearch(query);
    const videos = result.videos;
    if (!videos || videos.length === 0) return [];

    return videos.slice(0, limit).map((v) => ({
      videoId: v.videoId,
      title: v.title,
      thumbnail: v.thumbnail || `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`,
      duration: v.timestamp || '',
      views: v.views ? `${(v.views / 1000).toFixed(0)}K views` : '',
      author: v.author?.name || '',
      embedUrl: `https://www.youtube.com/embed/${v.videoId}?rel=0&modestbranding=1`,
    }));
  } catch (err) {
    console.warn(`[youtubeService] Search failed for "${query}": ${err.message}`);
    return [];
  }
};

module.exports = { searchYouTube };
