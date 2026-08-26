import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergeSeedAndOverlay, slugify, isSeedSlug } from "../src/wiki-merge.js";
import {
  parseHttpsUrl,
  parsePendingPayload,
  isPrivateIpv4,
  isBlockedHostname
} from "../api/lib/validate.js";
import { hashPassword, verifyPassword, passwordLooksUsable } from "../api/lib/password.js";
import { splitSqlStatements } from "../api/lib/sql-split.js";
import { isWikimediaHost, quoteExtract, parseWikipediaTarget } from "../api/lib/ingest.js";
import { sniffImage } from "../api/lib/cloudinary.js";
import { asInet, HttpError } from "../api/lib/http.js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("seed merge", () => {
  it("never replaces seed sections", () => {
    const seed = {
      typology: "Seed type",
      setting: "Seed setting",
      lead: "Seed lead",
      sections: [{ heading: "Form", paragraphs: ["Original."] }],
      related: ["japan"]
    };
    const overlay = {
      sections: [{ heading: "Note", paragraphs: ["Added."] }],
      sources: [{ title: "A book", url: "https://example.com" }]
    };
    const merged = mergeSeedAndOverlay(seed, overlay);
    assert.equal(merged.lead, "Seed lead");
    assert.equal(merged.sections[0].heading, "Form");
    assert.equal(merged.sections[1].heading, "Note");
    assert.equal(merged.sections.length, 2);
    assert.equal(merged.related[0], "japan");
  });

  it("slugifies titles the same way as the client", () => {
    assert.equal(slugify("Wind Towers of Yazd!"), "wind-towers-of-yazd");
    assert.equal(isSeedSlug("china"), true);
    assert.equal(isSeedSlug("atlantis"), false);
  });
});

describe("URL validation", () => {
  it("rejects private and metadata hosts", () => {
    assert.equal(isPrivateIpv4("127.0.0.1"), true);
    assert.equal(isPrivateIpv4("169.254.169.254"), true);
    assert.equal(isPrivateIpv4("8.8.8.8"), false);
    assert.equal(isBlockedHostname("metadata.google.internal"), true);
    assert.throws(() => parseHttpsUrl("http://example.com", { field: "url" }), HttpError);
    assert.throws(() => parseHttpsUrl("https://127.0.0.1/x", { field: "url" }), HttpError);
    assert.equal(parseHttpsUrl("https://en.wikipedia.org/wiki/Roof"), "https://en.wikipedia.org/wiki/Roof");
  });
});

describe("pending payload", () => {
  it("requires a title for a new page", () => {
    assert.throws(() => parsePendingPayload({ type: "page" }), HttpError);
  });

  it("accepts a visitor improve on a seed slug", () => {
    const row = parsePendingPayload({
      type: "improve",
      targetSlug: "china",
      sectionBody: "A note about dougong."
    });
    assert.equal(row.targetSlug, "china");
    assert.equal(row.sectionBody, "A note about dougong.");
  });
});

describe("passwords", () => {
  it("hashes and verifies with scrypt", async () => {
    const hash = await hashPassword("a-long-enough-secret");
    assert.equal(await verifyPassword("a-long-enough-secret", hash), true);
    assert.equal(await verifyPassword("wrong-password-xx", hash), false);
    assert.equal(passwordLooksUsable("short"), false);
  });
});

describe("SQL split", () => {
  it("keeps dollar-quoted function bodies together", () => {
    const stmts = splitSqlStatements(`
      CREATE TABLE t (id int);
      CREATE FUNCTION f() RETURNS void AS $$
      BEGIN
        INSERT INTO t VALUES (1);
      END;
      $$ LANGUAGE plpgsql;
    `);
    assert.equal(stmts.length, 2);
    assert.match(stmts[1], /CREATE FUNCTION/);
    assert.match(stmts[1], /INSERT INTO t/);
  });
});

describe("ingest allowlist", () => {
  it("only accepts Wikipedia hosts and short quotes", () => {
    assert.equal(isWikimediaHost("en.wikipedia.org"), true);
    assert.equal(isWikimediaHost("evil.example"), false);
    const target = parseWikipediaTarget("https://en.wikipedia.org/wiki/Dougong", null);
    assert.equal(target.title, "Dougong");
    assert.equal(quoteExtract("  a   b  ").length < 20, true);
    assert.throws(() => parseWikipediaTarget("https://example.com/wiki/x", null), HttpError);
  });
});

describe("image sniff", () => {
  it("accepts JPEG magic and rejects HTML", () => {
    assert.equal(sniffImage(Buffer.from([0xff, 0xd8, 0xff, 0x00])), "image/jpeg");
    assert.equal(sniffImage(Buffer.from("<svg></svg>")), null);
  });
});

describe("inet helper", () => {
  it("keeps ipv4 and ipv6 and drops junk", () => {
    assert.equal(asInet("127.0.0.1"), "127.0.0.1");
    assert.equal(asInet("::ffff:8.8.8.8"), "8.8.8.8");
    assert.equal(asInet("2001:db8::1"), "2001:db8::1");
    assert.equal(asInet("not-an-ip"), null);
  });
});

describe("launch-blocking imports", () => {
  it("migrate imports the SQL splitter", () => {
    const src = readFileSync(join(ROOT, "scripts", "migrate.mjs"), "utf8");
    assert.match(src, /import \{ splitSqlStatements \} from "\.\.\/api\/lib\/sql-split\.js"/);
  });

  it("wiki insertPending imports asInet", () => {
    const src = readFileSync(join(ROOT, "api", "lib", "wiki.js"), "utf8");
    assert.match(src, /import \{ asInet, HttpError \} from "\.\/http\.js"/);
  });

  it("cloudinary fallback uses the signed publicId", () => {
    const src = readFileSync(join(ROOT, "api", "lib", "cloudinary.js"), "utf8");
    assert.match(src, /data\.public_id \|\| publicId/);
    assert.doesNotMatch(src, /leafId/);
  });
});

describe("site Cloudinary catalog", () => {
  it("keeps local paths until a cloud name is set", async () => {
    const { siteSrc, sitePublicId, SITE_FILES } = await import("../src/cloudinary-site.js");
    assert.ok(SITE_FILES.includes("bg.png"));
    assert.ok(SITE_FILES.includes("roof-china.png"));
    assert.equal(sitePublicId("./roof-china.png"), "chimes/site/roof-china");
    assert.equal(siteSrc("./roof-china.png", { width: 1400 }), "./roof-china.png");
  });
});
