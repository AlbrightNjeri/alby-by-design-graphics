const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const crypto   = require('crypto');
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} = require('@aws-sdk/client-s3');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// ── S3 / R2 client ──────────────────────────────────────────────
const s3 = new S3Client({
  region: 'auto',  // R2 uses 'auto'
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  forcePathStyle: true,  // Required for R2 with AWS SDK v3
  credentials: {
    accessKeyId:     process.env.CLOUDFLARE_R2_ACCESS_KEY,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
  },
});

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET;
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, '');

// ── Multer: memory storage (no disk writes) ─────────────────────
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB   = 30;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WEBP, GIF`));
    }
  },
});

// ── Helper: generate a unique key ───────────────────────────────
function generateKey(originalName) {
  const ext  = path.extname(originalName).toLowerCase() || '.jpg';
  const hash = crypto.randomBytes(16).toString('hex');
  const ts   = Date.now();
  return `portfolio/${ts}-${hash}${ext}`;
}

// ──────────────────────────────────────────────────────────────
// POST /api/upload   [Auth required]
// Field name: "image"
// Returns: { url: "https://..." }
// ──────────────────────────────────────────────────────────────
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file received.' });
  }

  // Debug log: confirm env vars are loaded before attempting upload
  console.log('[upload] Config check:', {
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    bucket:   process.env.CLOUDFLARE_R2_BUCKET,
    hasKey:   !!process.env.CLOUDFLARE_R2_ACCESS_KEY,
    hasSecret: !!process.env.CLOUDFLARE_R2_SECRET_KEY,
    publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL,
  });

  const key = generateKey(req.file.originalname);

  try {
    await s3.send(new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         key,
      Body:        req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    const publicUrl = `${PUBLIC_URL}/${key}`;
    console.log(`[upload] Uploaded: ${publicUrl}`);
    res.status(201).json({ url: publicUrl, key });
  } catch (err) {
    console.error('[POST /upload] Full error:', err);
    res.status(500).json({ error: 'Image upload failed. Check R2 credentials.' });
  }
});

// ──────────────────────────────────────────────────────────────
// DELETE /api/upload   [Auth required]
// Body: { key: "portfolio/..." }
// ──────────────────────────────────────────────────────────────
router.delete('/', requireAuth, async (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ error: 'key is required.' });

  try {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /upload]', err.message);
    res.status(500).json({ error: 'Failed to delete image.' });
  }
});

// ── Multer error handler ─────────────────────────────────────
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: `File too large. Max size: ${MAX_SIZE_MB}MB.` });
    }
  }
  res.status(400).json({ error: err.message || 'Upload error.' });
});

module.exports = router;