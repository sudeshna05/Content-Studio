// Cloudflare R2 uploader — puts the rendered MP4 into an R2 bucket and returns
// a public https URL Instagram can fetch. Uses R2's S3-compatible API with a
// hand-rolled AWS SigV4 signature (no SDK, zero dependencies). All traffic is
// plain HTTPS/443, so it works behind corporate security agents.
//
// Requires in .env:
//   R2_ACCOUNT_ID       : your Cloudflare account id
//   R2_ACCESS_KEY_ID    : R2 API token access key id
//   R2_SECRET_ACCESS_KEY: R2 API token secret
//   R2_BUCKET           : bucket name
//   R2_PUBLIC_BASE_URL  : the bucket's public URL base, e.g.
//                         https://pub-xxxx.r2.dev  (or your custom domain)

import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

function hmac(key, str) { return crypto.createHmac('sha256', key).update(str).digest(); }
function sha256hex(buf) { return crypto.createHash('sha256').update(buf).digest('hex'); }

export function r2Configured(env = process.env) {
  return !!(env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY &&
    env.R2_BUCKET && env.R2_PUBLIC_BASE_URL);
}

/**
 * Upload a local file to R2 and return its public URL.
 * @param {string} localPath absolute path to the file
 * @param {string} key       object key (path within the bucket)
 */
export async function uploadToR2(localPath, key, env = process.env) {
  if (!r2Configured(env)) throw new Error('R2 is not configured (see INSTAGRAM_SETUP.md / .env).');

  const body = fs.readFileSync(localPath);
  const host = `${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const region = 'auto';
  const service = 's3';
  const method = 'PUT';
  const canonicalUri = `/${env.R2_BUCKET}/${key.split('/').map(encodeURIComponent).join('/')}`;

  // Timestamps (SigV4 needs UTC basic format). Note: Date.now works here; this
  // runs in the server process, not the workflow sandbox.
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ''); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8);

  const payloadHash = sha256hex(body);
  const contentType = key.endsWith('.mp4') ? 'video/mp4' : 'application/octet-stream';

  const canonicalHeaders =
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';

  const canonicalRequest = [
    method, canonicalUri, '', canonicalHeaders, signedHeaders, payloadHash,
  ].join('\n');

  const scope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256', amzDate, scope, sha256hex(Buffer.from(canonicalRequest)),
  ].join('\n');

  const kDate = hmac(`AWS4${env.R2_SECRET_ACCESS_KEY}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${env.R2_ACCESS_KEY_ID}/${scope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`https://${host}${canonicalUri}`, {
    method,
    headers: {
      'Content-Type': contentType,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
      Authorization: authorization,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`R2 upload failed (${res.status}): ${text.slice(0, 300)}`);
  }

  const base = env.R2_PUBLIC_BASE_URL.replace(/\/$/, '');
  return `${base}/${key.split('/').map(encodeURIComponent).join('/')}`;
}
