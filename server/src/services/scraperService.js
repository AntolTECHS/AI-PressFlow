// src/services/scraperService.js
import axios from "axios";
import * as cheerio from "cheerio";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { cleanText } from "../utils/textCleaner.js";

export async function scrapeUrl(url, opts = {}) {
  try {
    const res = await axios.get(url, {
      headers: {
        "User-Agent": opts.userAgent || "NewsAggregatorBot/1.0 (+https://yourdomain.example)",
        Accept: "text/html,application/xhtml+xml"
      },
      timeout: opts.timeout || 15_000
    });

    const html = res.data;

    // Try Readability first
    try {
      const dom = new JSDOM(html, { url });
      const doc = dom.window.document;
      const reader = new Readability(doc);
      const article = reader.parse();

      if (article && article.textContent) {
        const title = article.title || doc.querySelector("title")?.textContent || "";
        const content = cleanText(article.textContent);
        const excerpt = cleanText(article.excerpt || "");
        const ogImage = doc.querySelector('meta[property="og:image"]')?.content ||
                        doc.querySelector('meta[name="twitter:image"]')?.content ||
                        null;

        return {
          title,
          content,
          summary: excerpt,
          html: article.content || null,
          images: ogImage ? [ogImage] : [],
          canonical: doc.querySelector('link[rel="canonical"]')?.href || url,
        };
      }
    } catch (readErr) {
      console.warn("Readability fallback triggered:", readErr?.message || readErr);
    }

    // Fallback: Cheerio extraction
    const $ = cheerio.load(html);
    const title = $("meta[property='og:title']").attr("content") ||
                  $("title").text() || "";

    let paragraphs = [];
    $("article p, .article p, .post p, p").each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 50) paragraphs.push(text);
    });

    const content = cleanText(paragraphs.join("\n\n"));
    const ogImage = $("meta[property='og:image']").attr("content") ||
                    $("meta[name='twitter:image']").attr("content") ||
                    null;

    return {
      title,
      content,
      summary: content.slice(0, 500),
      html: null,
      images: ogImage ? [ogImage] : [],
      canonical: url
    };
  } catch (err) {
    console.error("scrapeUrl error:", err.message || err);
    throw err;
  }
}
