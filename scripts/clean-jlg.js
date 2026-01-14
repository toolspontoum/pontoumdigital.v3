
import sharp from 'sharp';

const input = 'public/images/partners/jlg-fixed.png';
const output = 'public/images/partners/jlg.webp';

async function processFinalJLG() {
    try {
        console.log('🔄 Cleaning fake checkerboard pattern from JLG logo...');

        const image = sharp(input);
        const { data, info } = await image
            .raw()
            .toBuffer({ resolveWithObject: true });

        const processedData = Buffer.alloc(info.width * info.height * 4);

        for (let i = 0; i < data.length; i += info.channels) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const targetIdx = (i / info.channels) * 4;

            // Checkerboard pattern is usually alternating grey squares (around 200-210 and 240-255)
            // Any pixel that is purely greyish (R~G~B) and VERY LIGHT is likely background
            const isGreyish = Math.abs(r - g) < 5 && Math.abs(g - b) < 5;
            const isLight = r > 190;

            processedData[targetIdx] = r;
            processedData[targetIdx + 1] = g;
            processedData[targetIdx + 2] = b;

            if (isGreyish && isLight) {
                processedData[targetIdx + 3] = 0; // Transparent
            } else {
                processedData[targetIdx + 3] = 255; // Opaque
            }
        }

        await sharp(processedData, {
            raw: { width: info.width, height: info.height, channels: 4 }
        })
            .webp({ quality: 90, lossless: true })
            .toFile(output);

        console.log('✅ JLG logo cleaned and saved as real transparent WebP');
    } catch (err) {
        console.error(err);
    }
}
processFinalJLG();
