const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const DIST_DIR = 'dist';
const ZIP_NAME = 'cliprefine-beta.zip';

// Files to obfuscate
const JS_FILES = [
  'background.js',
  'content.js',
  'popup.js',
  'options.js',
  'utils/license.js'
];

// Files to copy as-is
const COPY_FILES = [
  'manifest.json',
  'popup.html',
  'options.html',
  'styles.css'
];

// Directories to copy
const COPY_DIRS = [
  'icons'
];

// Obfuscation options - strong protection
const obfuscatorOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.7,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: true,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false
};

// Clean and create dist directory
function setupDist() {
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  fs.mkdirSync(DIST_DIR);
  fs.mkdirSync(path.join(DIST_DIR, 'utils'));
}

// Obfuscate JS files
function obfuscateFiles() {
  console.log('Obfuscating JavaScript files...');

  JS_FILES.forEach(file => {
    const srcPath = path.join(__dirname, file);
    const distPath = path.join(DIST_DIR, file);

    // Ensure directory exists
    const dir = path.dirname(distPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const code = fs.readFileSync(srcPath, 'utf8');
    const obfuscated = JavaScriptObfuscator.obfuscate(code, obfuscatorOptions);
    fs.writeFileSync(distPath, obfuscated.getObfuscatedCode());
    console.log(`  ✓ ${file}`);
  });
}

// Copy files as-is
function copyFiles() {
  console.log('Copying files...');

  COPY_FILES.forEach(file => {
    const srcPath = path.join(__dirname, file);
    const distPath = path.join(DIST_DIR, file);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, distPath);
      console.log(`  ✓ ${file}`);
    }
  });
}

// Copy directories
function copyDirs() {
  console.log('Copying directories...');

  COPY_DIRS.forEach(dir => {
    const srcPath = path.join(__dirname, dir);
    const distPath = path.join(DIST_DIR, dir);

    if (fs.existsSync(srcPath)) {
      copyDirRecursive(srcPath, distPath);
      console.log(`  ✓ ${dir}/`);
    }
  });
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Create ZIP file
async function createZip() {
  console.log('Creating ZIP archive...');

  const archiver = require('archiver');
  const output = fs.createWriteStream(path.join(__dirname, ZIP_NAME));
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`  ✓ ${ZIP_NAME} (${(archive.pointer() / 1024).toFixed(2)} KB)`);
      resolve();
    });

    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(DIST_DIR, false);
    archive.finalize();
  });
}

// Main build process
async function build() {
  console.log('\n=== ClipRefine BETA Build ===\n');

  try {
    setupDist();
    obfuscateFiles();
    copyFiles();
    copyDirs();
    await createZip();

    console.log('\n=== Build Complete ===');
    console.log(`Output: ${DIST_DIR}/`);
    console.log(`Package: ${ZIP_NAME}\n`);
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
