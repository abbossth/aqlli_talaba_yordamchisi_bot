// src/services/pptxService.ts
import { PresentationData } from "./aiService.js";
import { logger } from "../utils/logger.js";

export interface PresentationOptions {
  topic: string;
  author: string;
  pages: number;
  template: number;
  language: string;
  slides: PresentationData["slides"];
}

/**
 * Generate PPTX file from presentation data
 */
export async function generatePPTX(options: PresentationOptions): Promise<Buffer> {
  try {
    // Dynamic import for ES modules compatibility
    const pptxgenModule = await import("pptxgenjs");
    const PptxGenJS = (pptxgenModule.default || pptxgenModule) as any;
    
    const pptx = new PptxGenJS();

    // Set presentation properties
    pptx.author = options.author;
    pptx.company = "Aqlli Talaba Yordamchisi Bot";
    pptx.title = options.topic;

    // Template-based styling
    const templateStyles = getTemplateStyles(options.template);

    // Title slide
    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: templateStyles.primaryColor };
    
    titleSlide.addText(options.topic, {
      x: 0.5,
      y: 2,
      w: 9,
      h: 1.5,
      fontSize: 44,
      bold: true,
      color: templateStyles.textColor,
      align: "center",
      valign: "middle",
    });
    
    titleSlide.addText(options.author, {
      x: 0.5,
      y: 4,
      w: 9,
      h: 0.8,
      fontSize: 24,
      color: templateStyles.textColor,
      align: "center",
    });

    // Content slides
    const slidesToGenerate = Math.min(options.slides.length, options.pages - 1); // -1 for title slide

    for (let i = 0; i < slidesToGenerate; i++) {
      const slide = pptx.addSlide();
      const slideData = options.slides[i];

      if (!slideData || !slideData.title || !slideData.content) {
        logger.warn("Invalid slide data", { slideIndex: i, slideData });
        continue;
      }

      // Slide title
      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.8,
        fontSize: 32,
        bold: true,
        color: templateStyles.primaryColor,
      });

      // Slide content
      let yPos = 1.8;
      const lineHeight = 0.5;
      const fontSize = 18;

      slideData.content.forEach((point, index) => {
        if (yPos > 6.5) return; // Prevent overflow

        if (!point || point.trim().length === 0) {
          return; // Skip empty points
        }

        slide.addText(point, {
          x: 1,
          y: yPos,
          w: 8,
          h: lineHeight,
          fontSize: fontSize,
          color: templateStyles.textColor,
          bullet: true,
        });

        yPos += lineHeight + 0.15;
      });
    }

    // Generate buffer
    logger.info("Starting PPTX generation", {
      topic: options.topic,
      slidesCount: slidesToGenerate + 1,
    });

    // Use writeFile method and read it back, or use write with proper handling
    let buffer: Buffer;
    try {
      // Try different output types
      const result = pptx.write({ outputType: "nodebuffer" });
      
      // Handle Promise
      const resolvedResult = result instanceof Promise ? await result : result;
      
      // Convert to Buffer
      if (Buffer.isBuffer(resolvedResult)) {
        buffer = resolvedResult;
      } else if (resolvedResult instanceof Uint8Array) {
        buffer = Buffer.from(resolvedResult);
      } else if (resolvedResult instanceof ArrayBuffer) {
        buffer = Buffer.from(new Uint8Array(resolvedResult));
      } else if (typeof resolvedResult === "string") {
        // If it's a base64 string
        buffer = Buffer.from(resolvedResult, "base64");
      } else {
        // Try to convert to string and then to buffer
        logger.warn("Unexpected result type, attempting conversion", {
          type: typeof resolvedResult,
          constructor: resolvedResult?.constructor?.name,
        });
        
        // Last resort: try to write to file and read back
        const fs = await import("fs");
        const path = await import("path");
        const tempDir = path.join(process.cwd(), "temp");
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        const tempFile = path.join(tempDir, `temp_${Date.now()}.pptx`);
        
        await pptx.writeFile({ fileName: tempFile });
        buffer = fs.readFileSync(tempFile);
        fs.unlinkSync(tempFile);
      }
    } catch (writeError: any) {
      logger.error("Error in pptx.write()", {
        error: writeError,
        message: writeError?.message,
        stack: writeError?.stack,
      });
      
      // Fallback: try writeFile
      try {
        const fs = await import("fs");
        const path = await import("path");
        const tempDir = path.join(process.cwd(), "temp");
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        const tempFile = path.join(tempDir, `temp_${Date.now()}.pptx`);
        
        await pptx.writeFile({ fileName: tempFile });
        buffer = fs.readFileSync(tempFile);
        fs.unlinkSync(tempFile);
        
        logger.info("Successfully generated PPTX using writeFile fallback");
      } catch (fallbackError: any) {
        logger.error("Fallback writeFile also failed", fallbackError);
        throw new Error(
          `PPTX yaratishda xatolik: ${writeError?.message || "Noma'lum xatolik"}`
        );
      }
    }
    
    if (!buffer || buffer.length === 0) {
      throw new Error("PPTX fayl bo'sh yaratildi");
    }
    
    logger.info("PPTX generated successfully", {
      topic: options.topic,
      pages: options.pages,
      template: options.template,
      bufferSize: buffer.length,
    });

    return buffer;
  } catch (error: any) {
    logger.error("Error generating PPTX", {
      error: error,
      message: error?.message,
      stack: error?.stack,
      options: {
        topic: options.topic,
        pages: options.pages,
        template: options.template,
      },
    });
    throw error;
  }
}

/**
 * Get template styles based on template number
 */
function getTemplateStyles(template: number) {
  const templates: Record<number, { primaryColor: string; textColor: string }> = {
    1: {
      primaryColor: "1E88E5", // Blue (hex without #)
      textColor: "212121", // Dark gray (hex without #)
    },
    2: {
      primaryColor: "43A047", // Green (hex without #)
      textColor: "212121", // Dark gray (hex without #)
    },
  };

  return templates[template] || templates[1];
}
