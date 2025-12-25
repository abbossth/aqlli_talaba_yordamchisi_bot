// src/services/imageService.ts
import { logger } from "../utils/logger.js";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

/**
 * Get image URL from Pexels API
 */
async function getImageFromPexels(query: string): Promise<string | null> {
  try {
    if (!PEXELS_API_KEY) {
      logger.warn("PEXELS_API_KEY not set, skipping image download");
      return null;
    }

    const searchQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${searchQuery}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      logger.warn("Pexels API error", { status: response.status });
      return null;
    }

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.large || data.photos[0].src.medium;
    }

    return null;
  } catch (error: any) {
    logger.error("Error fetching image from Pexels", error);
    return null;
  }
}

/**
 * Download image from URL and return as Buffer
 */
async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error: any) {
    logger.error("Error downloading image", error);
    return null;
  }
}

/**
 * Get image for topic/slide
 */
export async function getImageForTopic(
  topic: string,
  slideTitle?: string
): Promise<Buffer | null> {
  try {
    // Try to get image using slide title first, then topic
    const searchQuery = slideTitle || topic;
    
    // Get image from Pexels
    const imageUrl = await getImageFromPexels(searchQuery);

    if (!imageUrl) {
      logger.warn("No image found for query", { query: searchQuery });
      return null;
    }

    // Download image
    const imageBuffer = await downloadImage(imageUrl);
    
    if (imageBuffer) {
      logger.info("Image downloaded successfully", { query: searchQuery });
    }

    return imageBuffer;
  } catch (error: any) {
    logger.error("Error getting image for topic", error);
    return null;
  }
}
