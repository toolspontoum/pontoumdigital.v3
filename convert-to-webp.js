
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Config
const IMAGE_DIRS = [
    'src/assets/images',
    'public' // Careful with public, often root
];

// Helper to find all images
function getAllImages(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                getAllImages(filePath, fileList);
            }
        } else {
            if (/\.(jpg|jpeg|png)$/i.test(file)) {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

async function convertImages() {
    console.log('🚀 Starting WebP Conversion...');

    let totalImages = 0;

    for (const dir of IMAGE_DIRS) {
        const fullPath = path.resolve(process.cwd(), dir);
        const images = getAllImages(fullPath);

        console.log(`Found ${images.length} images in ${dir}`);

        for (const imgPath of images) {
            const dirName = path.dirname(imgPath);
            const fileName = path.basename(imgPath, path.extname(imgPath));
            const newPath = path.join(dirName, `${fileName}.webp`);

            // Only convert if webp doesn't exist
            if (!fs.existsSync(newPath)) {
                try {
                    await sharp(imgPath)
                        .webp({ quality: 80 })
                        .toFile(newPath);
                    console.log(`✅ Converted: ${fileName}.webp`);
                    totalImages++;
                } catch (e) {
                    console.error(`❌ Failed: ${imgPath}`, e);
                }
            } else {
                // console.log(`Skipping (Already exists): ${fileName}.webp`);
            }
        }
    }

    console.log(`\n🎉 Conversion Complete! ${totalImages} new WebP images generated.`);
    console.log(`👉 Now you must update your HTML <img> tags to point to .webp versions or use <picture> tags.`);
}

convertImages();
