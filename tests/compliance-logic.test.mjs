import test from 'node:test';
import assert from 'node:assert';

// Verification function similar to logic in ResultPreview/App
function verifyCompliance(actual, requirements) {
  const issues = [];
  
  if (actual.width !== requirements.width || actual.height !== requirements.height) {
    issues.push(`Dimensions mismatch: expected ${requirements.width}x${requirements.height}, got ${actual.width}x${actual.height}`);
  }
  
  // Tolerant DPI check (+/- 1)
  if (Math.abs(actual.dpi - requirements.dpi) > 1) {
    issues.push(`DPI mismatch: expected ${requirements.dpi}, got ${actual.dpi}`);
  }
  
  if (actual.format.toLowerCase() !== requirements.format.toLowerCase()) {
    issues.push(`Format mismatch: expected ${requirements.format}, got ${actual.format}`);
  }
  
  if (requirements.maxFileSizeKb && actual.fileSizeKb > requirements.maxFileSizeKb) {
    issues.push(`File too large: max ${requirements.maxFileSizeKb}KB, got ${actual.fileSizeKb}KB`);
  }
  
  return {
    compliant: issues.length === 0,
    issues
  };
}

test('Image Compliance Logic', async (t) => {
  const reqs = {
    width: 600,
    height: 600,
    dpi: 300,
    format: 'jpeg',
    maxFileSizeKb: 240
  };

  await t.test('Perfect match is compliant', () => {
    const actual = { width: 600, height: 600, dpi: 300, format: 'jpeg', fileSizeKb: 200 };
    const result = verifyCompliance(actual, reqs);
    assert.strictEqual(result.compliant, true);
    assert.strictEqual(result.issues.length, 0);
  });

  await t.test('DPI tolerance works (299 is ok for 300)', () => {
    const actual = { width: 600, height: 600, dpi: 299, format: 'jpeg', fileSizeKb: 200 };
    const result = verifyCompliance(actual, reqs);
    assert.strictEqual(result.compliant, true);
  });

  await t.test('Dimension mismatch fails', () => {
    const actual = { width: 599, height: 600, dpi: 300, format: 'jpeg', fileSizeKb: 200 };
    const result = verifyCompliance(actual, reqs);
    assert.strictEqual(result.compliant, false);
    assert.ok(result.issues[0].includes('Dimensions mismatch'));
  });

  await t.test('Large file fails', () => {
    const actual = { width: 600, height: 600, dpi: 300, format: 'jpeg', fileSizeKb: 300 };
    const result = verifyCompliance(actual, reqs);
    assert.strictEqual(result.compliant, false);
    assert.ok(result.issues[0].includes('File too large'));
  });

  await t.test('Format mismatch fails', () => {
    const actual = { width: 600, height: 600, dpi: 300, format: 'png', fileSizeKb: 200 };
    const result = verifyCompliance(actual, reqs);
    assert.strictEqual(result.compliant, false);
    assert.ok(result.issues[0].includes('Format mismatch'));
  });
});
