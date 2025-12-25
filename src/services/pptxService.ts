// src/services/pptxService.ts
import { PresentationData } from "./aiService.js";
import { logger } from "../utils/logger.js";
import { getImageForTopic } from "./imageService.js";

export interface PresentationOptions {
  topic: string;
  author: string;
  pages: number;
  template: number;
  language: string;
  slides: PresentationData["slides"];
}

interface TemplateStyle {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
  accentColor: string;
  titleSlideStyle: "centered" | "left-aligned" | "gradient" | "minimal" | "image-background";
  contentSlideStyle: "classic" | "modern" | "minimal" | "bold" | "split" | "image-right" | "image-left";
}

/**
 * Get text color based on background
 */
function getTextColorForBackground(backgroundColor: string): string {
  // If background is light (white, light gray), use dark text
  const lightBackgrounds = ["FFFFFF", "F5F5F5", "FAFAFA", "EEEEEE"];
  if (lightBackgrounds.includes(backgroundColor.toUpperCase())) {
    return "212121"; // Dark gray
  }
  // If background is dark, use white text
  return "FFFFFF"; // White
}

/**
 * Get template styles based on template number
 */
function getTemplateStyles(template: number): TemplateStyle {
  const templates: Record<number, TemplateStyle> = {
    1: {
      primaryColor: "1E88E5", // Blue
      secondaryColor: "0D47A1", // Dark Blue
      textColor: "FFFFFF", // White
      backgroundColor: "FFFFFF", // White
      accentColor: "42A5F5", // Light Blue
      titleSlideStyle: "gradient",
      contentSlideStyle: "modern",
    },
    2: {
      primaryColor: "43A047", // Green
      secondaryColor: "2E7D32", // Dark Green
      textColor: "212121", // Dark Gray
      backgroundColor: "FFFFFF", // White
      accentColor: "66BB6A", // Light Green
      titleSlideStyle: "centered",
      contentSlideStyle: "classic",
    },
    3: {
      primaryColor: "E91E63", // Pink
      secondaryColor: "C2185B", // Dark Pink
      textColor: "FFFFFF", // White
      backgroundColor: "F5F5F5", // Light Gray
      accentColor: "F06292", // Light Pink
      titleSlideStyle: "image-background",
      contentSlideStyle: "split",
    },
    4: {
      primaryColor: "FF6F00", // Orange
      secondaryColor: "E65100", // Dark Orange
      textColor: "212121", // Dark Gray
      backgroundColor: "FFFFFF", // White
      accentColor: "FFB74D", // Light Orange
      titleSlideStyle: "left-aligned",
      contentSlideStyle: "image-right",
    },
    5: {
      primaryColor: "6A1B9A", // Purple
      secondaryColor: "4A148C", // Dark Purple
      textColor: "FFFFFF", // White
      backgroundColor: "FFFFFF", // White
      accentColor: "BA68C8", // Light Purple
      titleSlideStyle: "minimal",
      contentSlideStyle: "image-left",
    },
  };

  return templates[template] || templates[1];
}

/**
 * Create title slide based on template style
 */
async function createTitleSlide(
  pptx: any,
  topic: string,
  author: string,
  style: TemplateStyle
) {
  const slide = pptx.addSlide();

  switch (style.titleSlideStyle) {
    case "gradient":
      slide.background = { color: style.secondaryColor };
      
      slide.addShape("rect" as any, {
        x: 0,
        y: 0,
        w: "100%",
        h: "100%",
        fill: { color: style.primaryColor, transparency: 30 },
      });

      slide.addText(topic, {
        x: 0.5,
        y: 2.5,
        w: 9,
        h: 1.5,
        fontSize: 48,
        bold: true,
        color: style.textColor,
        align: "center",
        valign: "middle",
      });

      slide.addText(author, {
        x: 0.5,
        y: 4.5,
        w: 9,
        h: 0.8,
        fontSize: 28,
        color: style.textColor,
        align: "center",
      });

      slide.addShape("line" as any, {
        x: 1,
        y: 5.5,
        w: 8,
        h: 0,
        line: { color: style.accentColor, width: 2 },
      });
      break;

    case "centered":
      slide.background = { color: style.primaryColor };

      slide.addText(topic, {
        x: 0.5,
        y: 2,
        w: 9,
        h: 1.8,
        fontSize: 44,
        bold: true,
        color: style.textColor,
        align: "center",
        valign: "middle",
      });

      slide.addShape("roundRect" as any, {
        x: 2,
        y: 4.2,
        w: 6,
        h: 0.8,
        fill: { color: style.accentColor },
        line: { color: style.secondaryColor, width: 2 },
      });

      slide.addText(author, {
        x: 2,
        y: 4.3,
        w: 6,
        h: 0.8,
        fontSize: 24,
        bold: true,
        color: style.textColor,
        align: "center",
        valign: "middle",
      });
      break;

    case "minimal":
      slide.background = { color: style.backgroundColor };
      const minimalTextColor = getTextColorForBackground(style.backgroundColor);

      slide.addShape("line" as any, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 0,
        line: { color: style.primaryColor, width: 4 },
      });

      slide.addText(topic, {
        x: 0.5,
        y: 2,
        w: 9,
        h: 1.5,
        fontSize: 42,
        bold: true,
        color: style.primaryColor,
        align: "left",
        valign: "middle",
      });

      slide.addText(author, {
        x: 0.5,
        y: 4,
        w: 9,
        h: 0.8,
        fontSize: 22,
        color: minimalTextColor,
        align: "left",
      });
      break;

    case "left-aligned":
      slide.background = { color: style.backgroundColor };
      const leftTextColor = getTextColorForBackground(style.backgroundColor);

      slide.addShape("rect" as any, {
        x: 0,
        y: 0,
        w: 0.5,
        h: "100%",
        fill: { color: style.primaryColor },
      });

      slide.addText(topic, {
        x: 1,
        y: 2.5,
        w: 8.5,
        h: 1.5,
        fontSize: 46,
        bold: true,
        color: style.primaryColor,
        align: "left",
        valign: "middle",
      });

      slide.addText(author, {
        x: 1,
        y: 4.5,
        w: 8.5,
        h: 0.8,
        fontSize: 24,
        color: leftTextColor,
        align: "left",
      });
      break;

    case "image-background":
      const titleImage = await getImageForTopic(topic);
      
      if (titleImage) {
        try {
          const fs = await import("fs");
          const path = await import("path");
          const tempDir = path.join(process.cwd(), "temp");
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          const tempImageFile = path.join(tempDir, `title_${Date.now()}.jpg`);
          fs.writeFileSync(tempImageFile, titleImage);
          
          slide.background = { path: tempImageFile };
          slide.addShape("rect" as any, {
            x: 0,
            y: 0,
            w: "100%",
            h: "100%",
            fill: { color: "000000", transparency: 50 },
          });
        } catch (error: any) {
          logger.warn("Failed to set image background", error);
          slide.background = { color: style.primaryColor };
        }
      } else {
        slide.background = { color: style.primaryColor };
      }

      slide.addText(topic, {
        x: 0.5,
        y: 2.5,
        w: 9,
        h: 1.5,
        fontSize: 48,
        bold: true,
        color: style.textColor,
        align: "center",
        valign: "middle",
      });

      slide.addText(author, {
        x: 0.5,
        y: 4.5,
        w: 9,
        h: 0.8,
        fontSize: 28,
        color: style.textColor,
        align: "center",
      });
      break;
  }

  return slide;
}

/**
 * Get slide layout type based on index
 */
function getSlideLayoutType(slideIndex: number): "left-image-right" | "right-image-left" | "top-image-bottom" | "bottom-image-top" | "center-image" {
  const layouts: Array<"left-image-right" | "right-image-left" | "top-image-bottom" | "bottom-image-top" | "center-image"> = [
    "left-image-right",
    "right-image-left",
    "top-image-bottom",
    "bottom-image-top",
    "center-image",
  ];
  return layouts[slideIndex % layouts.length];
}

/**
 * Create content slide with various layouts and images
 */
async function createContentSlide(
  pptx: any,
  slideData: { title: string; content: string[] },
  style: TemplateStyle,
  slideIndex: number,
  topic: string
) {
  const slide = pptx.addSlide();
  
  // Always try to get image for every slide
  const slideImage = await getImageForTopic(topic, slideData.title);
  
  // Get layout type
  const layoutType = getSlideLayoutType(slideIndex);
  
  // Get text color based on background
  const textColor = getTextColorForBackground(style.backgroundColor);
  
  // Limit content based on slide index (vary content amount)
  const maxContentItems = slideIndex % 3 === 0 ? 3 : slideIndex % 2 === 0 ? 4 : 5;
  const displayContent = slideData.content.slice(0, maxContentItems);

  // Save image to temp file if exists
  let tempImageFile: string | null = null;
  if (slideImage) {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const tempDir = path.join(process.cwd(), "temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      tempImageFile = path.join(tempDir, `slide_${Date.now()}_${slideIndex}.jpg`);
      fs.writeFileSync(tempImageFile, slideImage);
    } catch (error: any) {
      logger.warn("Failed to save slide image", error);
    }
  }

  switch (layoutType) {
    case "left-image-right":
      slide.background = { color: style.backgroundColor };
      
      // Image on left
      if (tempImageFile) {
        try {
          slide.addImage({
            data: slideImage!,
            x: 0.3,
            y: 1.5,
            w: 4,
            h: 5,
          });
        } catch (error) {
          logger.warn("Failed to add image", error);
        }
      } else {
        // Decorative shape if no image
        slide.addShape("rect" as any, {
          x: 0.3,
          y: 1.5,
          w: 4,
          h: 5,
          fill: { color: style.accentColor, transparency: 70 },
        });
      }

      // Title on top right
      slide.addText(slideData.title, {
        x: 5,
        y: 0.5,
        w: 4.5,
        h: 0.8,
        fontSize: 32,
        bold: true,
        color: style.primaryColor,
      });

      // Content on right
      let yPos = 1.8;
      displayContent.forEach((point) => {
        if (yPos > 6.5) return;
        slide.addText(`• ${point}`, {
          x: 5,
          y: yPos,
          w: 4.5,
          h: 0.5,
          fontSize: 16,
          color: textColor,
        });
        yPos += 0.65;
      });
      break;

    case "right-image-left":
      slide.background = { color: style.backgroundColor };

      // Title on top left
      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.5,
        w: 4.5,
        h: 0.8,
        fontSize: 32,
        bold: true,
        color: style.primaryColor,
      });

      // Content on left
      let yPos2 = 1.8;
      displayContent.forEach((point) => {
        if (yPos2 > 6.5) return;
        slide.addText(`• ${point}`, {
          x: 0.5,
          y: yPos2,
          w: 4.5,
          h: 0.5,
          fontSize: 16,
          color: textColor,
        });
        yPos2 += 0.65;
      });

      // Image on right
      if (tempImageFile) {
        try {
          slide.addImage({
            data: slideImage!,
            x: 5.5,
            y: 1.5,
            w: 4.5,
            h: 5,
          });
        } catch (error) {
          logger.warn("Failed to add image", error);
        }
      } else {
        slide.addShape("rect" as any, {
          x: 5.5,
          y: 1.5,
          w: 4.5,
          h: 5,
          fill: { color: style.accentColor, transparency: 70 },
        });
      }
      break;

    case "top-image-bottom":
      slide.background = { color: style.backgroundColor };

      // Image on top
      if (tempImageFile) {
        try {
          slide.addImage({
            data: slideImage!,
            x: 1,
            y: 0.5,
            w: 8,
            h: 3,
          });
        } catch (error) {
          logger.warn("Failed to add image", error);
        }
      } else {
        slide.addShape("rect" as any, {
          x: 1,
          y: 0.5,
          w: 8,
          h: 3,
          fill: { color: style.accentColor, transparency: 70 },
        });
      }

      // Title below image
      slide.addText(slideData.title, {
        x: 0.5,
        y: 3.8,
        w: 9,
        h: 0.6,
        fontSize: 28,
        bold: true,
        color: style.primaryColor,
        align: "center",
      });

      // Content below title
      let yPos3 = 4.6;
      displayContent.forEach((point) => {
        if (yPos3 > 7) return;
        slide.addText(`• ${point}`, {
          x: 1,
          y: yPos3,
          w: 8,
          h: 0.4,
          fontSize: 14,
          color: textColor,
        });
        yPos3 += 0.5;
      });
      break;

    case "bottom-image-top":
      slide.background = { color: style.backgroundColor };

      // Title on top
      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.7,
        fontSize: 32,
        bold: true,
        color: style.primaryColor,
        align: "center",
      });

      // Content in middle
      let yPos4 = 1.5;
      displayContent.forEach((point) => {
        if (yPos4 > 3.5) return;
        slide.addText(`• ${point}`, {
          x: 1,
          y: yPos4,
          w: 8,
          h: 0.5,
          fontSize: 16,
          color: textColor,
        });
        yPos4 += 0.6;
      });

      // Image on bottom
      if (tempImageFile) {
        try {
          slide.addImage({
            data: slideImage!,
            x: 1,
            y: 4.5,
            w: 8,
            h: 3,
          });
        } catch (error) {
          logger.warn("Failed to add image", error);
        }
      } else {
        slide.addShape("rect" as any, {
          x: 1,
          y: 4.5,
          w: 8,
          h: 3,
          fill: { color: style.accentColor, transparency: 70 },
        });
      }
      break;

    case "center-image":
      slide.background = { color: style.backgroundColor };

      // Title on top
      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.7,
        fontSize: 30,
        bold: true,
        color: style.primaryColor,
        align: "center",
      });

      // Content on left
      let yPos5 = 1.2;
      const leftContent = displayContent.slice(0, Math.ceil(displayContent.length / 2));
      leftContent.forEach((point) => {
        if (yPos5 > 4) return;
        slide.addText(`• ${point}`, {
          x: 0.5,
          y: yPos5,
          w: 4,
          h: 0.5,
          fontSize: 14,
          color: textColor,
        });
        yPos5 += 0.6;
      });

      // Image in center
      if (tempImageFile) {
        try {
          slide.addImage({
            data: slideImage!,
            x: 4.5,
            y: 1.5,
            w: 5.5,
            h: 4,
          });
        } catch (error) {
          logger.warn("Failed to add image", error);
        }
      } else {
        slide.addShape("rect" as any, {
          x: 4.5,
          y: 1.5,
          w: 5.5,
          h: 4,
          fill: { color: style.accentColor, transparency: 70 },
        });
      }

      // Content on right
      let yPos6 = 1.2;
      const rightContent = displayContent.slice(Math.ceil(displayContent.length / 2));
      rightContent.forEach((point) => {
        if (yPos6 > 4) return;
        slide.addText(`• ${point}`, {
          x: 5.5,
          y: yPos6,
          w: 4.5,
          h: 0.5,
          fontSize: 14,
          color: textColor,
        });
        yPos6 += 0.6;
      });
      break;
  }

  // Add slide number
  if (slideIndex > 0) {
    slide.addText(`${slideIndex + 1}`, {
      x: 9.2,
      y: 7,
      w: 0.5,
      h: 0.3,
      fontSize: 12,
      color: style.primaryColor,
      align: "right",
    });
  }

  return slide;
}

/**
 * Generate PPTX file from presentation data
 */
export async function generatePPTX(options: PresentationOptions): Promise<Buffer> {
  try {
    const pptxgenModule = await import("pptxgenjs");
    const PptxGenJS = (pptxgenModule.default || pptxgenModule) as any;
    
    const pptx = new PptxGenJS();

    pptx.author = options.author;
    pptx.company = "Talaba AI Bot";
    pptx.title = options.topic;
    pptx.layout = "LAYOUT_WIDE";

    const templateStyle = getTemplateStyles(options.template);

    await createTitleSlide(pptx, options.topic, options.author, templateStyle);

    const slidesToGenerate = Math.min(options.slides.length, options.pages - 1);

    for (let i = 0; i < slidesToGenerate; i++) {
      const slideData = options.slides[i];

      if (!slideData || !slideData.title || !slideData.content) {
        logger.warn("Invalid slide data", { slideIndex: i, slideData });
        continue;
      }

      await createContentSlide(pptx, slideData, templateStyle, i, options.topic);
    }

    logger.info("Starting PPTX generation", {
      topic: options.topic,
      slidesCount: slidesToGenerate + 1,
      template: options.template,
    });

    let buffer: Buffer;
    try {
      const result = pptx.write({ outputType: "nodebuffer" });
      
      const resolvedResult = result instanceof Promise ? await result : result;
      
      if (Buffer.isBuffer(resolvedResult)) {
        buffer = resolvedResult;
      } else if (resolvedResult instanceof Uint8Array) {
        buffer = Buffer.from(resolvedResult);
      } else if (resolvedResult instanceof ArrayBuffer) {
        buffer = Buffer.from(new Uint8Array(resolvedResult));
      } else if (typeof resolvedResult === "string") {
        buffer = Buffer.from(resolvedResult, "base64");
      } else {
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
