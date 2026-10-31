export default async function handler(req, res) {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!query) return res.status(400).json({ error: "Enter a song or artist to search." });

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Server API key is not configured yet." });

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    videoEmbeddable: "true",
    maxResults: "10",
    regionCode: "ID",
    relevanceLanguage: "id",
    key: apiKey
  });

  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "YouTube search request failed."
      });
    }

    const tracks = (data.items || [])
      .filter(item => item.id?.videoId)
      .map(item => ({
        videoId: item.id.videoId,
        title: item.snippet?.title || "Untitled",
        artist: item.snippet?.channelTitle || "YouTube",
        thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || ""
      }));

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json(tracks);
  } catch {
    return res.status(500).json({ error: "Unable to reach YouTube right now." });
  }
}
