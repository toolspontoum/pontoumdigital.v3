
import sharp from 'sharp';

const input = 'public/images/partners/jlg-raw.png';
const output = 'public/images/partners/jlg.webp';

async function processJLG() {
    try {
        console.log('🔄 Processing JLG logo: darken white text + remove background...');

        const image = sharp(input);
        const { data, info } = await image
            .raw()
            .toBuffer({ resolveWithObject: true });

        const processedData = Buffer.alloc(info.width * info.height * 4);

        for (let i = 0; i < data.length; i += info.channels) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = info.channels === 4 ? data[i + 3] : 255;

            const targetIdx = (i / info.channels) * 4;

            // Check if it's white or very light (threshold 230)
            const isWhite = r > 230 && g > 230 && b > 230;

            if (isWhite) {
                // If it's the background (assumed to be white at the edges) 
                // we'll make it transparent.
                // But wait, the user wants the WHITE TEXT to be BLACK.
                // Let's assume most white pixels are text, EXCEPT the background.
                // A better approach: 
                // 1. Keep the colored icon pixels as they are.
                // 2. Identify white pixels.
                // 3. Make them BLACK.
                // 4. Then make the absolute background (usually edges) transparent.

                // For this specific logo, the background is white.
                // If we make ALL white pixels black, the whole image background becomes black.
                // So we need to be smart: 
                // Usually background pixels are at alpha 0 if already transparent, 
                // but this looks like a flat PNG with white background.

                // Let's try: If it's white, make it BLACK and keep alpha at 255.
                // Then later we can trim/remove the outer white if it was transparent, 
                // or just keep it as a logo asset.
                // Actually, the user wants "Tire o fundo".

                // REVISED LOGIC:
                // If pixel is NOT white/very light, it's either the COLORFUL icon or ALREADY black (if any).
                // Keep icon colors.
                // If pixel IS white:
                //   If it's within the logo area (this is hard without edge detection), 
                //   BUT usually, we can just say: 
                //   Make specific non-white pixels STAY as is.
                //   Make ALL white pixels BLACK.
                //   Then we will have a logo with black text on black background? NO.

                // Let's use image generation to do the heavy lifting of "masking" or 
                // just use sharp to turn white to black and then use a transparent background.

                // Actually, if I turn WHITE to BLACK, I lose the background transparency.
                // Let's just use the generated image tool to create a clean version.
            }
        }
    } catch (err) { }
}
