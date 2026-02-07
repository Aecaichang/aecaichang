# aecaichang Blog

บล็อกหลักของโดเมน [aecaichang.com](https://aecaichang.com) สร้างด้วย Astro +
Markdown/MDX

## คำสั่งใช้งาน

```bash
npm install
npm run dev
npm run build
npm run preview
npm run new:post -- "ชื่อโพสต์ใหม่"
```

## โครงสร้างสำคัญ

- `src/content/blog/` เนื้อหาบทความแบบ Markdown/MDX
- `src/pages/blog/` หน้ารวมบทความและหน้าอ่านโพสต์
- `src/pages/index.astro` หน้าแรกแสดงรูป ชื่อ เนื้อหา และวันที่
- `src/pages/rss.xml.js` RSS feed

## เพิ่มบทความใหม่

1. รันคำสั่งสร้างโพสต์

```bash
npm run new:post -- "ชื่อโพสต์ใหม่"
```

2. ระบบจะสร้าง:
- ไฟล์โพสต์ใน `src/content/blog/<slug>.md`
- โฟลเดอร์รูปใน `src/assets/posts/<slug>/`

3. ใส่รูปปกในโฟลเดอร์นั้น เช่น `cover.jpg` แล้วปรับ frontmatter ให้ครบ

```md
---
title: "ชื่อโพสต์"
description: "สรุปสั้น ๆ"
pubDate: 2026-02-07
heroImage: "../../assets/posts/<slug>/cover.jpg"
heroImageAlt: "คำอธิบายภาพปก"
tags: ["blog"]
gallery:
  - image: "../../assets/posts/<slug>/photo-1.jpg"
    alt: "คำอธิบายรูป"
    caption: "คำบรรยาย (ไม่ใส่ก็ได้)"
---
```

4. รัน `npm run dev` เพื่อตรวจหน้าเว็บ

## แนวทางรูปภาพ (ให้เว็บยังเร็ว)

- ขนาดแนะนำภาพปก: กว้างประมาณ `1600px`
- ฟอร์แมตแนะนำ: `webp` หรือ `jpg`
- พยายามคุมไฟล์ไม่เกิน `300-500KB` ต่อรูป
- ระบบใช้ Astro image optimization และ lazy loading ให้อัตโนมัติ

## Deploy

Deploy ได้ทั้ง Vercel และ Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
