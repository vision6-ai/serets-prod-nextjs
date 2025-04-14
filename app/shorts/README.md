# Shorts Feature - Aspect Ratio Handling

## Overview

This document explains how the shorts feature handles videos with different aspect ratios, particularly focusing on how 16:9 (landscape) videos are displayed in a vertical shorts feed.

## Video Aspect Ratio Support

The shorts feed is designed primarily for vertical (9:16) videos, similar to TikTok, YouTube Shorts, and Instagram Reels. However, we've enhanced it to gracefully handle different aspect ratios:

- **9:16 (Vertical)**: Full-screen display, optimal for mobile viewing
- **16:9 (Landscape)**: Centered in the view with a blurred background
- **1:1 (Square)**: Adapted to fit the vertical container

## How 16:9 Videos Are Handled

When a 16:9 landscape video (typical movie trailer format) is displayed in the shorts feed:

1. **Auto-detection**: The player automatically detects the video's aspect ratio on load
2. **Main Video**: The 16:9 video is displayed at its native aspect ratio in the center of the screen
3. **Background Effect**: A blurred, zoomed version of the same video is used as a background to fill empty space
4. **Visual Hierarchy**: The main video sits above the blurred background with proper z-index ordering

## Implementation Details

The main components that handle this functionality are:

- `video-player.tsx`: Contains the logic for detecting aspect ratio and rendering appropriate video styling
- `shorts-feed.tsx`: Handles the swipe interactions and overall feed structure

Key technical aspects:

- The aspect ratio is detected using the video's `videoWidth` and `videoHeight` properties
- Videos with aspect ratio ≥ 1.5 are considered "landscape"
- Tailwind CSS is used for styling with conditional classes based on the detected aspect ratio

## Testing

You can test how different aspect ratio videos appear in the feed by:

1. Navigating to `/shorts/test-videos`
2. Replacing the placeholder Cloudflare IDs with actual video IDs of different aspect ratios
3. Viewing the feed on both mobile and desktop devices

## Best Practices for Video Content

While the player can handle different aspect ratios, here are recommendations for optimal user experience:

- **For dedicated shorts content**: Use 9:16 aspect ratio (1080×1920 pixels)
- **For movie trailers**: 16:9 is acceptable but be aware it won't fill the entire mobile screen
- **Center important content**: Ensure key visual elements are centered in the frame
- **Test on mobile devices**: Always verify how your content looks on mobile screens
- **Consider both aspect ratios**: If possible, provide both 16:9 and 9:16 versions of important videos

## Future Improvements

Potential future enhancements:

- Add option to crop 16:9 videos to 9:16 for a more immersive experience
- Implement smart cropping to focus on important areas of landscape videos
- Add aspect ratio selection in the admin interface when uploading videos 