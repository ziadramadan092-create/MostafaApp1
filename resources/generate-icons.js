// resources/generate-icons.js
// تشغيل: node resources/generate-icons.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = __dirname;

// مقاسات Android المطلوبة (mipmap)
const ANDROID_ICON_SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const FOREGROUND_SIZES = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

const SPLASH_SIZES = [480, 720, 1080, 1440, 1920, 2732];

async function generateIcons() {
  const androidRes = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
  if (!fs.existsSync(androidRes)) {
    console.error('❌ مجلد android غير موجود. شغّل: npx cap add android');
    process.exit(1);
  }

  console.log('🎨 جاري توليد الأيقونات...\n');

  // 1. الأيقونة العادية
  const iconSvg = path.join(SRC, 'icon.svg');
  for (const [folder, size] of Object.entries(ANDROID_ICON_SIZES)) {
    const outDir = path.join(androidRes, folder);
    fs.mkdirSync(outDir, { recursive: true });
    await sharp(iconSvg).resize(size, size).png().toFile(path.join(outDir, 'ic_launcher.png'));
    await sharp(iconSvg).resize(size, size).png().toFile(path.join(outDir, 'ic_launcher_round.png'));
    console.log(`  ✅ ${folder}/ic_launcher.png (${size}px)`);
  }

  // 2. الأيقونة الأمامية (Adaptive)
  const fgSvg = path.join(SRC, 'icon-foreground.svg');
  for (const [folder, size] of Object.entries(FOREGROUND_SIZES)) {
    const outDir = path.join(androidRes, folder);
    fs.mkdirSync(outDir, { recursive: true });
    await sharp(fgSvg).resize(size, size).png().toFile(path.join(outDir, 'ic_launcher_foreground.png'));
    console.log(`  ✅ ${folder}/ic_launcher_foreground.png (${size}px)`);
  }

  // 3. الخلفية
  const bgSvg = path.join(SRC, 'icon-background.svg');
  const bgDir = path.join(androidRes, 'mipmap-xxxhdpi');
  await sharp(bgSvg).resize(432, 432).png().toFile(path.join(bgDir, 'ic_launcher_background.png'));
  console.log(`  ✅ mipmap-xxxhdpi/ic_launcher_background.png`);

  // 4. شاشة البداية
  const splashSvg = path.join(SRC, 'splash.svg');
  const splashDir = path.join(androidRes, 'drawable');
  fs.mkdirSync(splashDir, { recursive: true });
  for (const size of SPLASH_SIZES) {
    const outDir = path.join(androidRes, `drawable-${size > 1920 ? 'xxxhdpi' : size > 1440 ? 'xxhdpi' : size > 1080 ? 'xhdpi' : size > 720 ? 'hdpi' : 'mdpi'}`);
    fs.mkdirSync(outDir, { recursive: true });
    await sharp(splashSvg).resize(size, size).png().toFile(path.join(outDir, 'splash.png'));
    console.log(`  ✅ splash ${size}px`);
  }

  // 5. Adaptive icon XML
  const adaptiveXml = `<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;
  fs.writeFileSync(path.join(androidRes, 'mipmap-anydpi-v26', 'ic_launcher.xml'), adaptiveXml);
  fs.writeFileSync(path.join(androidRes, 'mipmap-anydpi-v26', 'ic_launcher_round.xml'), adaptiveXml);
  fs.mkdirSync(path.join(androidRes, 'mipmap-anydpi-v26'), { recursive: true });
  fs.writeFileSync(path.join(androidRes, 'mipmap-anydpi-v26', 'ic_launcher.xml'), adaptiveXml);
  fs.writeFileSync(path.join(androidRes, 'mipmap-anydpi-v26', 'ic_launcher_round.xml'), adaptiveXml);
  console.log(`  ✅ mipmap-anydpi-v26/ic_launcher.xml (Adaptive)`);

  // 6. نسخ PNG للـ resources (للأرشيف)
  const outResources = path.join(SRC, 'png');
  fs.mkdirSync(outResources, { recursive: true });
  await sharp(iconSvg).resize(1024, 1024).png().toFile(path.join(outResources, 'icon-1024.png'));
  await sharp(fgSvg).resize(1024, 1024).png().toFile(path.join(outResources, 'icon-foreground-1024.png'));
  await sharp(bgSvg).resize(1024, 1024).png().toFile(path.join(outResources, 'icon-background-1024.png'));
  await sharp(splashSvg).resize(2732, 2732).png().toFile(path.join(outResources, 'splash-2732.png'));
  console.log(`\n📦 نسخ PNG محفوظة في resources/png/`);

  console.log('\n🎉 تم توليد كل الأيقونات بنجاح!');
}

generateIcons().catch(err => {
  console.error('❌ خطأ:', err.message);
  process.exit(1);
});
