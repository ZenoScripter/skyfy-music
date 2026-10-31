# SKYFY MUSIC — YouTube Search + Official Player

A manga/comic-inspired static music discovery website with animated interactions, YouTube Data API search through a Vercel Function, and playback using the official YouTube IFrame Player.

## Configure API key
In Vercel Project Settings → Environment Variables, add:
- Name: `YOUTUBE_API_KEY`
- Value: your Google Cloud YouTube Data API v3 key

Keep the key out of client-side files. Redeploy after setting the environment variable.

## Deploy
1. Upload this folder to a GitHub repository.
2. Import the repository in Vercel.
3. Framework preset: Other.
4. Build command: leave blank.
5. Output directory: `.` (root).
6. Deploy.
7. Add `YOUTUBE_API_KEY` under Vercel Environment Variables and redeploy.

## Notes
- Search results are public YouTube videos; playback is through YouTube's official embedded player.
- The YouTube player may show ads or require normal YouTube playback behavior.
- Favorites use browser localStorage on this device/browser.
- A full streaming catalog and persistent cross-device playlists require additional licensed provider integration and storage.
