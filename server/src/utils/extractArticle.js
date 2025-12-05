// extractArticle.js
import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import Mercury from "@postlight/mercury-parser";
import * as cheerio from "cheerio";
import LangDetect from "languagedetect";

/**
 * CLEAN TEXT
 */
function cleanText(text = "") {
  return text
    .replace(/\s+/g, " ")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/ADVERTISEMENT/gi, "")
    .trim();
}

const ld = new LangDetect();

/**
 * CHEERIO BASIC FALLBACK PARSER
 */
function cheerioFallback(html, url) {
  const $ = cheerio.load(html);

  // Title
  const title =
    $("meta[property='og:title']").attr("content") ||
    $("meta[name='twitter:title']").attr("content") ||
    $("title").text() ||
    "";

  // Prefer <article>
  let content = $("article").text().trim();

  if (!content || content.length < 150) {
    content = $("body").text();
  }

  // Images
  const images = [];
  const ogImg = $("meta[property='og:image']").attr("content");
  if (ogImg) images.push(ogImg);

  $("img").each((i, el) => {
    const src = $(el).attr("src");
    if (src && src.startsWith("http")) images.push(src);
  });

  return {
    title: cleanText(title),
    content: cleanText(content),
    textContent: cleanText(content),
    images,
    author: $("meta[name='author']").attr("content") || null,
    date:
      $("meta[property='article:published_time']").attr("content") ||
      null,
    extractor: "cheerio",
    url
  };
}

/**
 * MAIN EXTRACTION PIPELINE
 */
export async function extractArticle(url) {
  try {
    // FETCH HTML
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
      }
    });

    const html = response.data;

    // -----------------------------------------------------
    // 1️⃣ MERCURY PARSER (BEST for news sites)
    // -----------------------------------------------------
    try {
      const mercuryResult = await Mercury.parse(url);

      if (mercuryResult?.content && mercuryResult.content.length > 200) {
        const $ = cheerio.load(mercuryResult.content);

        const text = cleanText($.text());

        return {
          title: cleanText(mercuryResult.title),
          content: mercuryResult.content,
          textContent: text,
          images: mercuryResult.lead_image_url ? [mercuryResult.lead_image_url] : [],
          author: mercuryResult.author || null,
          date: mercuryResult.date_published || null,
          lang: ld.detect(text)[0]?.[0] || null,
          extractor: "mercury",
          url
        };
      }
    } catch (err) {
      console.log("Mercury failed → trying Readability");
    }

    // -----------------------------------------------------
    // 2️⃣ READABILITY (GOOD fallback, works on paywalls)
    // -----------------------------------------------------
    try {
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (article?.textContent && article.textContent.length > 200) {
        const content = cleanText(article.textContent);

        return {
          title: cleanText(article.title),
          content: article.content,
          textContent: content,
          images: [],
          author: null,
          date: null,
          lang: ld.detect(content)[0]?.[0] || null,
          extractor: "readability",
          url
        };
      }
    } catch (err) {
      console.log("Readability failed → using Cheerio fallback");
    }

    // -----------------------------------------------------
    // 3️⃣ CHEERIO SIMPLE FALLBACK (GUARANTEED)
    // -----------------------------------------------------
    const fallback = cheerioFallback(html, url);
    fallback.lang = ld.detect(fallback.textContent)[0]?.[0] || null;
    return fallback;

  } catch (error) {
    return {
      error: true,
      message: error.message,
      url
    };
  }
}
