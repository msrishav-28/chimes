import { HttpError } from "./http.js";
import { isBlockedHostname, isPrivateIpv4, parseHttpsUrl } from "./validate.js";
import { isSeedSlug, slugify } from "../../src/wiki-merge.js";

const WIKI_HOST = /^([a-z]{2,3}\.)?(m\.)?wikipedia\.org$/i;

export function isWikimediaHost(hostname) {
  const host = String(hostname || "").toLowerCase();
  return WIKI_HOST.test(host);
}

export function parseWikipediaTarget(rawUrl, rawTitle) {
  if (rawUrl) {
    const href = parseHttpsUrl(rawUrl, { field: "url", required: true });
    const url = new URL(href);
    if (!isWikimediaHost(url.hostname) || isPrivateIpv4(url.hostname) || isBlockedHostname(url.hostname)) {
      throw new HttpError(400, "invalid_input", "Ingest only accepts Wikipedia https URLs.");
    }
    if (url.pathname.startsWith("/api/rest_v1/page/summary/")) {
      return {
        host: url.hostname.replace(/^([a-z]{2,3}\.)?m\./, (m, lang) => (lang || "en.") ),
        title: decodeURIComponent(url.pathname.split("/").pop() || "")
      };
    }
    const wiki = url.pathname.match(/^\/wiki\/([^#?]+)/);
    if (!wiki) {
      throw new HttpError(400, "invalid_input", "That Wikipedia URL is not an article page.");
    }
    return { host: url.hostname, title: decodeURIComponent(wiki[1]) };
  }
  const title = String(rawTitle || "").trim();
  if (!title) {
    throw new HttpError(400, "invalid_input", "Provide a Wikipedia URL or article title.");
  }
  return { host: "en.wikipedia.org", title };
}

export function quoteExtract(extract) {
  return String(extract || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 800);
}

export async function fetchWikipediaSummary({ host, title }) {
  if (!isWikimediaHost(host)) {
    throw new HttpError(400, "invalid_input", "Ingest only accepts Wikipedia.");
  }
  const encoded = encodeURIComponent(title.replace(/ /g, "_"));
  const href = `https://${host}/api/rest_v1/page/summary/${encoded}`;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 8000);
  let res;
  try {
    res = await fetch(href, {
      signal: ac.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "ChimesWiki/1.0 (draft ingest; +https://github.com/msrishav-28/chimes)"
      }
    });
  } catch {
    throw new HttpError(502, "ingest_failed", "Wikipedia did not respond.");
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 404) {
    throw new HttpError(404, "not_found", "Wikipedia has no page by that title.");
  }
  if (!res.ok) {
    throw new HttpError(502, "ingest_failed", "Wikipedia summary could not be read.");
  }
  const data = await res.json();
  const license = String(data.license?.url || data.content_urls?.desktop?.page || "");
  const extract = quoteExtract(data.extract);
  if (!extract) {
    throw new HttpError(422, "empty_extract", "That page has no short extract to quote.");
  }
  const displayTitle = String(data.titles?.normalized || data.title || title).replace(/_/g, " ");
  const pageUrl = data.content_urls?.desktop?.page || `https://${host}/wiki/${encoded}`;
  const slug = slugify(displayTitle);
  return {
    title: displayTitle.slice(0, 120),
    lead: extract.slice(0, 1200),
    sectionHeading: "From Wikipedia",
    sectionBody: extract,
    sourceTitle: `${displayTitle} — Wikipedia (CC BY-SA)`,
    sourceUrl: pageUrl,
    targetSlug: isSeedSlug(slug) ? slug : null,
    ingestUrl: href,
    license
  };
}
