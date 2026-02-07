import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contentDir = path.join(root, 'src/content/blog');
const assetsDir = path.join(root, 'src/assets/posts');

const rawTitle = process.argv.slice(2).join(' ').trim();
if (!rawTitle) {
  console.error('Usage: npm run new:post -- "ชื่อโพสต์"');
  process.exit(1);
}

const normalizedTitle = rawTitle
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim();

const slug = normalizedTitle
  .toLowerCase()
  .replace(/[^\u0E00-\u0E7Fa-z0-9\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

const safeSlug =
  slug ||
  `post-${new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)}`;

const postPath = path.join(contentDir, `${safeSlug}.md`);
const postAssetDir = path.join(assetsDir, safeSlug);

if (fs.existsSync(postPath)) {
  console.error(`Post already exists: ${path.relative(root, postPath)}`);
  process.exit(1);
}

fs.mkdirSync(postAssetDir, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const template = `---
title: "${rawTitle}"
description: "สรุปสั้น ๆ ของบทความนี้"
pubDate: ${today}
# ใส่หลังอัปโหลดรูปจริงเท่านั้น
# heroImage: "../../assets/posts/${safeSlug}/cover.jpg"
# heroImageAlt: "คำอธิบายภาพปก"
tags: ["blog"]
gallery: []
---

เริ่มเขียนเนื้อหาที่นี่
`;

fs.writeFileSync(postPath, template, 'utf8');

console.log('Created:');
console.log(`- ${path.relative(root, postPath)}`);
console.log(`- ${path.relative(root, postAssetDir)}/`);
if (!slug) {
  console.log(`- slug fallback: ${safeSlug}`);
}
console.log('Next: put your images in that folder and edit frontmatter.');
