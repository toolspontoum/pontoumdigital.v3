
import sharp from 'sharp';
import path from 'path';

const input = 'public/images/partners/prumo.jpg';
const output = 'public/images/partners/prumo.webp';

async function processLogo() {
    try {
        console.log('🔄 Processing Prumo logo for transparency...');

        // Load the image and its metadata
        const image = sharp(input);
        const metadata = await image.metadata();

        // Create a mask where white is transparent
        // We look for pixels where R, G, B are all > 240 (almost white)
        const { data, info } = await image
            .raw()
            .toBuffer({ resolveWithObject: true });

        const transparentData = Buffer.alloc(info.width * info.height * 4);

        for (let i = 0; i < data.length; i += info.channels) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const targetIdx = (i / info.channels) * 4;

            transparentData[targetIdx] = r;
            transparentData[targetIdx + 1] = g;
            transparentData[targetIdx + 2] = b;

            // If it's white (very light), set alpha to 0
            // Increased threshold slightly for cleaner edges
            if (r > 240 && g > 240 && b > 240) {
                transparentData[targetIdx + 3] = 0;
            } else {
                transparentData[targetIdx + 3] = 255;
            }
        }

        await sharp(transparentData, {
            raw: {
                width: info.width,
                height: info.height,
                channels: 4
            }
        })
            .webp({ quality: 90, lossless: true })
            .toFile(output);

        console.log('✅ Logo Prumo processed successfully as transparent WebP!');
    } catch (err) {
        console.error('❌ Error processing logo:', err);
    }
}

processLogo();
