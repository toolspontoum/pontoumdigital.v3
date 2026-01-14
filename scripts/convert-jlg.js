
import sharp from 'sharp';

const input = 'public/images/partners/jlg.png';
const output = 'public/images/partners/jlg.webp';

async function convertJLG() {
    try {
        await sharp(input)
            .webp({ quality: 90 })
            .toFile(output);
        console.log('✅ JLG logo converted to WebP');
    } catch (err) {
        console.error(err);
    }
}
convertJLG();
