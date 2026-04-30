export interface PresetSEO {
  title: string
  description: string
  h1: string
  intro: string
  bodyHtml: string
  officialSource?: string
  officialSourceLabel?: string
  faqs: { q: string; a: string }[]
}

export const PRESET_SEO: Record<string, PresetSEO> = {
  "us-passport": {
    title: "US Passport Photo Resize — Free Online Tool | 600×600px 300 DPI",
    description:
      "Resize any photo to meet official US passport requirements: 600×600 px, 300 DPI, JPEG, under 240 KB. Free, instant, private — no upload to third-party servers.",
    h1: "US Passport Photo Size Tool",
    intro:
      "US passport photos must be exactly 600×600 pixels at 300 DPI in JPEG format and under 240 KB. The State Department rejects applications with incorrect specifications. Upload your photo below and ComplyPic will resize, adjust DPI, and compress it to meet every requirement in one pass.",
    bodyHtml: `<p>The US State Department has strict technical requirements for passport photo submissions, especially for online renewals via the myPhoto tool. Getting these specs wrong means your application is rejected and you need to resubmit.</p>
<p>The key requirements are: <strong>2×2 inches (600×600 pixels at 300 DPI)</strong>, plain white or off-white background, head between 1 inch and 1⅜ inches from chin to crown, and the file must be JPEG under 240 KB for digital submission.</p>
<p>ComplyPic handles all of this automatically — resize, DPI correction, format conversion, and compression — without uploading your photo to any third-party server.</p>`,
    officialSource: "https://travel.state.gov/content/travel/en/passports/need-a-passport/photos.html",
    officialSourceLabel: "US State Department — Passport Photo Requirements",
    faqs: [
      {
        q: "What are the exact pixel dimensions for a US passport photo?",
        a: "A US passport photo must be 600×600 pixels when submitted digitally at 300 DPI, which corresponds to a 2×2 inch print. The head must occupy 50–69% of the frame height (between 1 inch and 1⅜ inches from chin to top of head).",
      },
      {
        q: "What file format and size is required for a US passport photo?",
        a: "Digital submissions must be JPEG format under 240 KB. ComplyPic automatically compresses your photo to meet this limit while maintaining maximum quality.",
      },
      {
        q: "Can I take my own US passport photo at home?",
        a: "Yes. Take a photo with a smartphone against a plain white wall in good natural light, then use ComplyPic to resize it to 600×600 px at 300 DPI. Use our Background Remover tool if needed to create a clean white background.",
      },
      {
        q: "Does the background need to be pure white for a US passport photo?",
        a: "The background must be plain white or off-white with no shadows, patterns, or other people. If your photo has a non-white background, use ComplyPic's Background Remover tool before processing.",
      },
    ],
  },

  "eu-passport": {
    title: "EU Passport & Schengen Visa Photo Resize — Free Tool | 413×531px",
    description:
      "Resize photos for EU passport or Schengen visa: 413×531 px, 300 DPI, JPEG, under 500 KB. Meets ICAO biometric standards. Free, instant, private.",
    h1: "EU Passport & Schengen Visa Photo Tool",
    intro:
      "EU passport and Schengen visa photos follow ICAO biometric standards: 413×531 pixels at 300 DPI, JPEG format, under 500 KB. These specs apply to most European countries including Germany, France, Spain, Italy, and the Netherlands. Upload your photo to resize it to exact compliance.",
    bodyHtml: `<p>The International Civil Aviation Organization (ICAO) biometric photo standard is used across the European Union and Schengen Area. While individual countries may have minor variations, the core specs — 35×45 mm (413×531 px at 300 DPI) with the head occupying 70–80% of the frame height — apply broadly.</p>
<p>Key requirements: <strong>413×531 pixels at 300 DPI</strong>, JPEG under 500 KB, neutral expression, eyes open and clearly visible, no glasses, plain light-colored background.</p>
<p>ComplyPic applies the correct dimensions, DPI metadata, and compression automatically.</p>`,
    officialSource: "https://www.icao.int/Security/FAL/TRIP/Documents/TR-Portrait-Quality-v1.0.pdf",
    officialSourceLabel: "ICAO Portrait Quality Standard",
    faqs: [
      {
        q: "What size is an EU passport photo in pixels?",
        a: "EU passport photos are 35×45 mm, which is 413×531 pixels at 300 DPI. This ICAO standard applies to most EU countries and Schengen visa applications.",
      },
      {
        q: "Does the same photo size work for a Schengen visa?",
        a: "Yes. The Schengen visa photo requirement is identical to the EU passport standard: 35×45 mm (413×531 px at 300 DPI), JPEG, under 500 KB for digital submission.",
      },
      {
        q: "Are glasses allowed in EU passport photos?",
        a: "No. Since 2015, glasses are not permitted in EU passport photos. Remove glasses before taking your photo.",
      },
      {
        q: "What background color is required for an EU passport photo?",
        a: "The background must be plain white or light gray (near-white) with no shadows. ComplyPic's Background Remover can help create a clean background.",
      },
    ],
  },

  "ireland-permit": {
    title: "Ireland Employment Permit Photo — Free Resize Tool | 413×531px",
    description:
      "Resize photos for Ireland Employment Permit applications: 413×531 px, 300 DPI, JPEG, under 240 KB. Meets DETE requirements. Free and instant.",
    h1: "Ireland Employment Permit Photo Tool",
    intro:
      "Ireland Employment Permit applications require a specific photo format: 413×531 pixels at 300 DPI, JPEG under 240 KB. This matches the Irish Department of Enterprise, Trade and Employment (DETE) specifications. Upload your photo below to get a fully compliant file instantly.",
    bodyHtml: `<p>The Department of Enterprise, Trade and Employment (DETE) requires applicants for Irish work permits — including Critical Skills Employment Permits, General Employment Permits, and Intra-Company Transfer Permits — to submit a passport-style photo meeting specific technical requirements.</p>
<p>The specifications are: <strong>413×531 pixels at 300 DPI</strong>, JPEG format, maximum file size 240 KB, plain white background, neutral expression. These must be met exactly for the online IEP system to accept your application.</p>`,
    officialSource: "https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/",
    officialSourceLabel: "DETE — Ireland Employment Permits",
    faqs: [
      {
        q: "What photo size is required for an Ireland Employment Permit?",
        a: "Ireland Employment Permit photos must be 413×531 pixels at 300 DPI, in JPEG format, and under 240 KB. This is the ICAO biometric standard used across Irish government applications.",
      },
      {
        q: "Can I use the same photo for an Ireland work permit and an EU passport?",
        a: "Yes. The Ireland Employment Permit photo spec (413×531 px, 300 DPI, JPEG ≤240 KB) is compatible with the EU passport standard (413×531 px, 300 DPI, JPEG ≤500 KB). The same processed photo works for both.",
      },
      {
        q: "What happens if my photo doesn't meet the Ireland permit requirements?",
        a: "The IEP online system will reject your application at the upload stage if the photo does not meet the technical specifications. You will need to resubmit, which delays your application processing.",
      },
    ],
  },

  "linkedin": {
    title: "LinkedIn Profile Photo Size — Free Resize Tool | 400×400px PNG",
    description:
      "Resize your LinkedIn profile photo to 400×400 px PNG instantly. Optimal quality for LinkedIn's compression. Free, no login, no watermark.",
    h1: "LinkedIn Profile Photo Resizer",
    intro:
      "LinkedIn recommends a 400×400 pixel PNG for profile photos. Uploading a larger image and letting LinkedIn compress it often results in blurry thumbnails across the platform. Upload your photo below to get the perfect size — and use the Background Remover for a professional clean look.",
    bodyHtml: `<p>LinkedIn compresses all uploaded photos, but starting with the correct dimensions (400×400 px) and format (PNG) minimizes quality loss. A properly sized photo appears sharp across all devices — desktop feed, mobile app, search results, and connection requests.</p>
<p>For professional headshots on LinkedIn, a <strong>white or solid neutral background</strong> helps your face stand out in the small circular thumbnail format. Use ComplyPic's Background Remover to create a clean background before resizing.</p>
<p>LinkedIn also supports photos up to 8 MB, but a well-optimized 400×400 PNG will typically be under 500 KB and display sharply everywhere.</p>`,
    faqs: [
      {
        q: "What is the ideal LinkedIn profile photo size?",
        a: "LinkedIn recommends 400×400 pixels at a minimum, in PNG or JPEG format. PNG preserves more detail for headshots. The maximum file size is 8 MB, though a well-optimized 400×400 PNG is typically under 500 KB.",
      },
      {
        q: "Should my LinkedIn profile photo be square?",
        a: "Yes. LinkedIn crops profile photos to a circle for display, so your photo should be square (400×400 px) with your face centered. ComplyPic's crop tool lets you adjust exactly where the frame sits.",
      },
      {
        q: "What background looks best for a LinkedIn profile photo?",
        a: "A plain white, light gray, or solid neutral-colored background works best. It keeps the focus on your face and looks professional in both the circular thumbnail and the full profile view.",
      },
      {
        q: "Can I use a JPEG instead of PNG for LinkedIn?",
        a: "Yes, LinkedIn accepts both JPEG and PNG. PNG is recommended for headshots because it handles skin tones and fine hair details with less compression artifacting than JPEG at the same file size.",
      },
    ],
  },

  "linkedin-banner": {
    title: "LinkedIn Banner Photo Size — Free Resize Tool | 1584×396px",
    description:
      "Resize your LinkedIn personal background banner to 1584×396 px JPEG instantly. Correct aspect ratio for all devices. Free and instant.",
    h1: "LinkedIn Personal Banner Resizer",
    intro:
      "LinkedIn personal profile banners should be 1584×396 pixels (a 4:1 ratio) in JPEG format. An incorrectly sized banner gets cropped unpredictably on mobile. Upload your image and ComplyPic will resize it to the exact recommended dimensions.",
    bodyHtml: `<p>Your LinkedIn background banner is one of the first things visitors see on your profile. An image that is too small gets pixelated; an image that is not the right ratio gets cropped in unexpected places, especially on mobile.</p>
<p>The recommended dimensions are <strong>1584×396 pixels</strong> — a 4:1 aspect ratio. LinkedIn will display roughly the center 1584×220 pixels on mobile, so keep important visual elements centered and in the top two-thirds of the image.</p>`,
    faqs: [
      {
        q: "What size should a LinkedIn background banner be?",
        a: "LinkedIn recommends 1584×396 pixels (4:1 aspect ratio) for personal profile background banners. File size should be under 8 MB in JPEG or PNG format.",
      },
      {
        q: "Will my LinkedIn banner look different on mobile?",
        a: "Yes. Mobile crops the banner to approximately 1584×220 pixels (the center of the image). Keep text and key visual elements away from the very top and bottom edges to avoid them being cut off on mobile.",
      },
    ],
  },

  "linkedin-company-banner": {
    title: "LinkedIn Company Page Banner — Free Resize Tool | 1128×191px",
    description:
      "Resize your LinkedIn company page banner to 1128×191 px JPEG instantly. Correct dimensions for company profiles. Free and instant.",
    h1: "LinkedIn Company Banner Resizer",
    intro:
      "LinkedIn company page banners have different dimensions from personal profile banners: 1128×191 pixels at approximately a 5.9:1 aspect ratio. Uploading an incorrectly sized image leads to unpredictable cropping. Use this tool to get the exact right size.",
    bodyHtml: `<p>LinkedIn company pages use a narrower, more horizontal banner format than personal profiles. The recommended size is <strong>1128×191 pixels</strong>. The effective display area on mobile is even narrower, so keep your logo or key messaging centered horizontally.</p>`,
    faqs: [
      {
        q: "What is the correct size for a LinkedIn company page banner?",
        a: "LinkedIn company page banners should be 1128×191 pixels. This is different from personal profile banners (1584×396 px). JPEG format under 4 MB is recommended.",
      },
    ],
  },

  "cv-headshot": {
    title: "CV / Resume Headshot Photo Resize — Free Tool | 600×600px JPEG",
    description:
      "Resize your CV or resume headshot to 600×600 px JPEG, under 500 KB. Professional quality, instantly compliant. Free, no login required.",
    h1: "CV & Resume Headshot Photo Tool",
    intro:
      "Most applicant tracking systems (ATS) and job portals that accept photos expect a square headshot between 400×400 and 600×600 pixels in JPEG format under 500 KB. ComplyPic resizes and optimizes your headshot to these standard dimensions in one step.",
    bodyHtml: `<p>Adding a professional headshot to your CV or resume is common practice in Europe, Asia, and Latin America. The photo is typically printed or displayed small (around 3×3 cm), so the image must be high enough resolution to stay sharp.</p>
<p>The standard CV headshot spec is <strong>600×600 pixels</strong> at 96 DPI, JPEG format, under 500 KB. This keeps the file small enough for email and ATS upload limits while maintaining print quality at the typical headshot size.</p>`,
    faqs: [
      {
        q: "What size should a CV photo be?",
        a: "A standard CV headshot is 600×600 pixels in JPEG format, under 500 KB. For a printed CV, 300 DPI is ideal. For digital-only submission, 96 DPI is sufficient.",
      },
      {
        q: "Should I add a photo to my resume?",
        a: "In the US and UK, photos on resumes are generally not recommended due to bias concerns. In Germany, France, Spain, and most of Asia and Latin America, a professional headshot is standard practice.",
      },
    ],
  },

  "job-portal-photo": {
    title: "Job Portal Profile Photo Resize — Free Tool | 400×400px JPEG",
    description:
      "Resize your profile photo for job portals to 400×400 px JPEG, under 300 KB. Works for Indeed, Glassdoor, StepStone and more. Free and instant.",
    h1: "Job Portal Profile Photo Resizer",
    intro:
      "Job portals like Indeed, Glassdoor, Monster, and StepStone typically require profile photos of 400×400 pixels in JPEG format under 300 KB. Uploading an oversized file can cause upload errors or poor image quality. Use this tool to get the exact right size.",
    bodyHtml: `<p>A professional profile photo on job portals increases profile view rates and recruiter engagement. The most widely accepted spec across job platforms is <strong>400×400 pixels</strong> in JPEG format, under 300 KB.</p>
<p>Use a neutral background, face the camera directly, and ensure good lighting. Dress professionally as you would for an interview.</p>`,
    faqs: [
      {
        q: "What photo size does Indeed require?",
        a: "Indeed recommends profile photos of at least 200×200 pixels, with 400×400 px being the optimal size. JPEG or PNG format under 5 MB is accepted, but keeping it under 300 KB ensures fast loading.",
      },
    ],
  },

  "youtube-thumbnail": {
    title: "YouTube Thumbnail Size — Free Resize Tool | 1280×720px JPEG",
    description:
      "Resize images to YouTube thumbnail spec: 1280×720 px, 16:9 ratio, JPEG under 2 MB. Maximum click-through quality. Free and instant.",
    h1: "YouTube Thumbnail Resizer",
    intro:
      "YouTube thumbnails must be 1280×720 pixels (16:9 ratio), JPEG format, under 2 MB. Thumbnails that don't meet these specs get rejected or display poorly across devices. Upload your image and ComplyPic will resize it to the exact YouTube specification.",
    bodyHtml: `<p>YouTube thumbnails are the single biggest factor in click-through rate (CTR) for most channels. Getting the technical specs right ensures your thumbnail is sharp on all devices — from 4K monitors to phone screens.</p>
<p>The required spec is <strong>1280×720 pixels</strong> (16:9 aspect ratio), JPEG format, maximum file size 2 MB. YouTube recommends using the maximum 1280×720 resolution rather than the minimum 640×360 to maintain quality when displayed large.</p>
<p>Custom thumbnails require a verified YouTube account with no Community Guidelines violations in the past 90 days.</p>`,
    officialSource: "https://support.google.com/youtube/answer/72431",
    officialSourceLabel: "YouTube — Thumbnail image requirements",
    faqs: [
      {
        q: "What is the correct size for a YouTube thumbnail?",
        a: "YouTube thumbnails should be 1280×720 pixels at a 16:9 aspect ratio. Maximum file size is 2 MB. JPEG, PNG, BMP, or GIF formats are accepted, though JPEG is recommended for photos.",
      },
      {
        q: "Why is my YouTube thumbnail blurry?",
        a: "Blurry thumbnails are usually caused by uploading an image smaller than 1280×720 px, which YouTube then upscales. Always start with the full 1280×720 px resolution.",
      },
      {
        q: "Does YouTube compress thumbnails?",
        a: "Yes. YouTube recompresses all thumbnails. Starting with a high-quality JPEG under 2 MB minimizes visible compression artifacts in the final displayed thumbnail.",
      },
    ],
  },

  "youtube-banner": {
    title: "YouTube Channel Banner Size — Free Resize Tool | 2560×1440px",
    description:
      "Resize your YouTube channel art to 2560×1440 px JPEG, under 6 MB. Displays correctly on TV, desktop, tablet, and mobile. Free and instant.",
    h1: "YouTube Channel Banner Resizer",
    intro:
      "YouTube channel banners must be 2560×1440 pixels to display properly on all devices — TV, desktop, tablet, and mobile. Each device shows a different crop of the banner. Upload your image to resize it to the correct specification.",
    bodyHtml: `<p>YouTube channel art is one image that is cropped differently depending on the viewing device. The safe zone for content that appears on all devices is the center <strong>1546×423 pixels</strong>. The full 2560×1440 image is only visible on TV screens.</p>
<p>Upload a 2560×1440 px JPEG under 6 MB, and keep all important text and branding within the center safe zone.</p>`,
    officialSource: "https://support.google.com/youtube/answer/2972003",
    officialSourceLabel: "YouTube — Channel art dimensions",
    faqs: [
      {
        q: "What size should a YouTube channel banner be?",
        a: "YouTube channel banners should be 2560×1440 pixels in JPEG, PNG, BMP, or GIF format, under 6 MB. The safe zone visible on all devices is the center 1546×423 pixels.",
      },
      {
        q: "What part of the YouTube banner is visible on mobile?",
        a: "On mobile, YouTube shows approximately the center 1546×423 pixels of your 2560×1440 banner. Keep logos, channel names, and key information within this central area.",
      },
    ],
  },

  "youtube-profile": {
    title: "YouTube Profile Picture Size — Free Resize Tool | 800×800px PNG",
    description:
      "Resize your YouTube channel profile picture to 800×800 px PNG. Displayed as a circle — sharp on all devices. Free and instant.",
    h1: "YouTube Profile Picture Resizer",
    intro:
      "YouTube profile pictures are displayed as a circle and must be at least 800×800 pixels in PNG format. Note that YouTube profile pictures are managed through your Google Account, so changes appear across all Google services.",
    bodyHtml: `<p>Your YouTube profile picture is displayed as a <strong>circular crop</strong> in comments, search results, and on your channel page. The recommended size is 800×800 pixels in PNG format with a 1:1 aspect ratio.</p>
<p>Since YouTube uses your Google Account photo, changing it here will update your picture across Gmail, Google Meet, Google Drive, and other Google services.</p>`,
    faqs: [
      {
        q: "What size is a YouTube profile picture?",
        a: "YouTube profile pictures should be 800×800 pixels in PNG or JPEG format. They are displayed as circles, so keep your face or logo centered and away from the edges.",
      },
    ],
  },

  "instagram-square": {
    title: "Instagram Square Post Size — Free Resize Tool | 1080×1080px",
    description:
      "Resize images to Instagram square post spec: 1080×1080 px JPEG, under 4 MB. Maximum quality for the feed. Free and instant.",
    h1: "Instagram Square Post Resizer",
    intro:
      "Instagram square posts should be 1080×1080 pixels in JPEG format. Instagram compresses uploads aggressively — starting with the correct size and a quality JPEG minimizes visible compression in your feed. Upload your image to resize it to Instagram's optimal spec.",
    bodyHtml: `<p>Instagram accepts photos from 320×320 to 1080×1080 pixels for square posts. However, uploading at exactly <strong>1080×1080 pixels</strong> prevents Instagram from upscaling (which adds blur) or downscaling (which wastes resolution).</p>
<p>JPEG format at high quality with a file size under 4 MB gives Instagram's compression algorithm the best input to work with, resulting in a sharper final image in the feed.</p>`,
    officialSource: "https://help.instagram.com/1469029763400082",
    officialSourceLabel: "Instagram — Photo and video specifications",
    faqs: [
      {
        q: "What is the best image size for an Instagram post?",
        a: "For square posts, 1080×1080 pixels is the ideal size. Instagram accepts up to 1080 px on the longest side. JPEG format under 4 MB is recommended for photos.",
      },
      {
        q: "Why do Instagram photos look blurry after uploading?",
        a: "Instagram compresses all photos after upload. Uploading at exactly 1080×1080 px with a high-quality JPEG gives the compression algorithm the best possible input, resulting in a sharper final image.",
      },
    ],
  },

  "instagram-portrait": {
    title: "Instagram Portrait Post Size — Free Resize Tool | 1080×1350px",
    description:
      "Resize images to Instagram portrait post spec: 1080×1350 px, 4:5 ratio, JPEG under 4 MB. Maximum feed real estate. Free and instant.",
    h1: "Instagram Portrait Post Resizer",
    intro:
      "Instagram portrait posts at 1080×1350 pixels (4:5 ratio) take up more vertical space in the feed than square posts, increasing visibility and engagement. This is the maximum vertical ratio Instagram allows for feed posts.",
    bodyHtml: `<p>The 4:5 ratio (1080×1350 px) is the vertical format that maximizes screen space in the Instagram feed. It is wider than a Story but taller than a square post, making it ideal for product shots, portraits, and lifestyle photography.</p>
<p>Instagram will crop images taller than 1350 px to the 4:5 ratio. Use ComplyPic's crop tool to choose exactly which part of your image is shown.</p>`,
    faqs: [
      {
        q: "What is the maximum vertical size for an Instagram post?",
        a: "The maximum height for an Instagram feed post is a 4:5 ratio, which is 1080×1350 pixels. Images taller than this are cropped by Instagram automatically.",
      },
    ],
  },

  "instagram-story": {
    title: "Instagram Story & Reel Size — Free Resize Tool | 1080×1920px",
    description:
      "Resize images to Instagram Story and Reel spec: 1080×1920 px (9:16), JPEG under 4 MB. Full-screen vertical format. Free and instant.",
    h1: "Instagram Story & Reel Resizer",
    intro:
      "Instagram Stories and Reels use a full vertical 9:16 format at 1080×1920 pixels. Images that don't match this ratio get letterboxed with blurred bars. Upload your image to resize it to the exact Story/Reel specification.",
    bodyHtml: `<p>Instagram Stories and Reels are displayed full-screen in a 9:16 vertical format (1080×1920 px). If your image is a different ratio, Instagram adds blurred background bars — which look unprofessional.</p>
<p>Start with a 1080×1920 px JPEG for Stories and keep important content in the center of the frame, away from the top 250 px (UI overlay area) and bottom 250 px (swipe-up or link area).</p>`,
    faqs: [
      {
        q: "What size should an Instagram Story image be?",
        a: "Instagram Stories should be 1080×1920 pixels (9:16 ratio) in JPEG or PNG format, under 4 MB for images. This fills the full screen without letterboxing.",
      },
      {
        q: "Can I use the same image for Instagram Stories and Reels?",
        a: "Yes. Both use the 1080×1920 px (9:16) format. For Reels with text overlays, keep important elements in the center 1080×1420 px area to avoid UI chrome overlap.",
      },
    ],
  },

  "amazon-main": {
    title: "Amazon Main Product Image Size — Free Tool | 2000×2000px White BG",
    description:
      "Resize product photos to Amazon main image spec: 2000×2000 px JPEG, white background, under 10 MB. Meets Amazon's zoom requirements. Free and instant.",
    h1: "Amazon Main Product Image Resizer",
    intro:
      "Amazon requires main product images to be at least 1000×1000 pixels to enable the zoom feature, with 2000×2000 being the recommended size. The background must be pure white (RGB 255,255,255). Non-compliant images risk listing suppression. Resize and optimize your product photo to meet every Amazon requirement here.",
    bodyHtml: `<p>Amazon's main image (MAIN) requirements are strictly enforced and violations can lead to listing suppression, meaning your product becomes invisible in search results.</p>
<p>The key rules: <strong>2000×2000 pixels</strong> recommended (1000×1000 minimum for zoom), <strong>pure white background</strong> (RGB 255,255,255 — not cream or off-white), product must fill at least 85% of the frame, JPEG format, under 10 MB. No text, logos, or watermarks are allowed on MAIN images.</p>
<p>Use ComplyPic's Background Remover to create a clean white background, then resize to 2000×2000 px with the "Add Padding" fit mode to keep your product proportions correct.</p>`,
    officialSource: "https://sellercentral.amazon.com/help/hub/reference/G1881",
    officialSourceLabel: "Amazon Seller Central — Product Image Requirements",
    faqs: [
      {
        q: "What are Amazon's main product image requirements?",
        a: "Amazon MAIN images must be at least 1000×1000 px (2000×2000 recommended), JPEG format, pure white background (RGB 255,255,255), product filling at least 85% of the frame, under 10 MB. No text, logos, or watermarks are allowed.",
      },
      {
        q: "Why does Amazon require a white background on main images?",
        a: "Amazon requires pure white backgrounds to create a consistent shopping experience and improve product visibility in search results. Images with off-white or colored backgrounds are rejected by Amazon's automated compliance system.",
      },
      {
        q: "What happens if my Amazon product image doesn't comply?",
        a: "Non-compliant MAIN images result in listing suppression — your product stops appearing in search results and category browsing. Amazon sends a compliance alert in Seller Central with 48 hours to fix the issue.",
      },
      {
        q: "What image size does Amazon require for the zoom feature?",
        a: "Amazon's zoom feature requires images to be at least 1000×1000 pixels on the longest side. The recommended size is 2000×2000 pixels for maximum zoom quality.",
      },
    ],
  },

  "amazon-secondary": {
    title: "Amazon Secondary Product Image Size — Free Tool | 1600×1600px",
    description:
      "Resize secondary product images for Amazon to 1600×1600 px JPEG, under 10 MB. Lifestyle and detail shots. Free and instant.",
    h1: "Amazon Secondary Product Image Resizer",
    intro:
      "Amazon secondary images (PT01–PT08) don't require a white background but must be at least 1000×1000 pixels. The recommended size is 1600×1600 pixels in JPEG format. These images can show lifestyle shots, product details, size charts, and infographics.",
    bodyHtml: `<p>Amazon allows up to 9 images per listing (1 MAIN + up to 8 secondary). Unlike the MAIN image, secondary images (PT01–PT08) can have any background and can include text, lifestyle photos, infographics, size charts, and 360° views.</p>
<p>The recommended size for secondary images is <strong>1600×1600 pixels</strong> in JPEG format, under 10 MB. Maintaining the same square ratio across all images creates a consistent, professional listing.</p>`,
    faqs: [
      {
        q: "What size should Amazon secondary product images be?",
        a: "Amazon secondary images should be at least 1000×1000 px, with 1600×1600 px recommended. JPEG format under 10 MB. Unlike MAIN images, they can have any background and include text overlays.",
      },
      {
        q: "How many images can I have on an Amazon product listing?",
        a: "Amazon allows up to 9 images per listing: 1 MAIN image (white background required) and up to 8 secondary images (PT01–PT08) where lifestyle photos and infographics are allowed.",
      },
    ],
  },
}
