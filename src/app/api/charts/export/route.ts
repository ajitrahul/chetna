import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, PDFFont } from 'pdf-lib';
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import fs from 'fs';
import path from 'path';

// Helper to wrapping text lines
const wrapText = (text: string, font: PDFFont, size: number, maxWidth: number) => {
    if (typeof text !== 'string') return [];
    const paragraphs = text.split(/\r?\n/);
    let lines: string[] = [];

    for (const paragraph of paragraphs) {
        if (!paragraph) {
            lines.push('');
            continue;
        }
        const words = paragraph.split(' ');
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const width = font.widthOfTextAtSize(testLine, size);
            if (width > maxWidth) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);
    }
    return lines;
};

// Justified Text Drawer
const drawJustifiedBlock = (page: any, text: string, x: number, y: number, font: PDFFont, size: number, color: any, maxWidth: number, lineHeight: number) => {
    const lines = wrapText(text, font, size, maxWidth);
    let currentY = y;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check Page Break
        if (currentY < 60) return { y: currentY, remainingLines: lines.slice(i), pageBreakNeeded: true };

        // Determine if we should justify this line
        // Last line of paragraph or single word line should NOT be justified
        const isLastLine = i === lines.length - 1 || lines[i + 1] === '';

        if (isLastLine || !line) {
            page.drawText(line, { x, y: currentY, size, font, color });
        } else {
            // Justify
            const words = line.split(' ');
            if (words.length > 1) {
                const totalWordWidth = words.reduce((acc, w) => acc + font.widthOfTextAtSize(w, size), 0);
                const totalSpace = maxWidth - totalWordWidth;
                const spaceWidth = totalSpace / (words.length - 1);

                let currentX = x;
                for (let j = 0; j < words.length; j++) {
                    page.drawText(words[j], { x: currentX, y: currentY, size, font, color });
                    currentX += font.widthOfTextAtSize(words[j], size) + spaceWidth;
                }
            } else {
                page.drawText(line, { x, y: currentY, size, font, color });
            }
        }
        currentY -= lineHeight;
    }
    return { y: currentY, remainingLines: [], pageBreakNeeded: false };
};

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const { chartKey, chartTitle, profileId, chartData, userDetails, texts, chartImage } = await req.json();

        if (!profileId || !chartData) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        const profile = await prisma.profile.findUnique({
            where: { id: profileId },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

        // Assets
        let logoImage: any;
        try {
            const logoPath = path.join(process.cwd(), 'public', 'icons', 'logo_dark.jpg');
            if (fs.existsSync(logoPath)) {
                const logoBytes = fs.readFileSync(logoPath);
                logoImage = await pdfDoc.embedJpg(logoBytes);
            }
        } catch (e) {
            console.error("Logo load error", e);
        }

        let embeddedChartImage;
        if (chartImage) {
            try {
                const base64Data = chartImage.replace(/^data:image\/\w+;base64,/, "");
                const imageBytes = Buffer.from(base64Data, 'base64');
                embeddedChartImage = await pdfDoc.embedPng(imageBytes);
            } catch (e) {
                console.warn("Chart image embed error", e);
            }
        }

        // Colors
        const goldColor = rgb(0.83, 0.68, 0.21); // #D4AF37
        const darkColor = rgb(0.1, 0.1, 0.1);
        const grayColor = rgb(0.4, 0.4, 0.4);
        const lightGray = rgb(0.9, 0.9, 0.9);

        // --- TITLE PAGE (Page 1) ---
        let page = pdfDoc.addPage();
        let { width, height } = page.getSize();



        // 1. Large Logo Centered (Absolute Position)
        if (logoImage) {
            // Reduced to 25% of page width to prevent overlap
            const targetWidth = width * 0.25;
            const logoScale = targetWidth / logoImage.width;
            const logoDims = logoImage.scale(logoScale);
            const logoX = (width - logoDims.width) / 2;

            // Draw logo at top
            page.drawImage(logoImage, {
                x: logoX,
                y: height - 120 - logoDims.height,
                width: logoDims.width,
                height: logoDims.height,
            });
        }

        // 2. Report Title (Absolute Position - No Overlap)
        // Fixed Y coordinate at height - 350 to ensure clearance
        let finalTitle = chartTitle || `${chartKey} Analysis Report`;
        if (profile.name && !finalTitle.includes(profile.name)) {
            finalTitle = `${finalTitle} for ${profile.name}`;
        }

        const titleY = height - 350;

        const titleWidth = boldFont.widthOfTextAtSize(finalTitle, 24);
        page.drawText(finalTitle, {
            x: (width - titleWidth) / 2,
            y: titleY,
            size: 24,
            font: boldFont,
            color: darkColor
        });

        // 3. Subtitle
        const subTitle = "Personalized Astrological Insight";
        const subWidth = font.widthOfTextAtSize(subTitle, 14);
        page.drawText(subTitle, {
            x: (width - subWidth) / 2,
            y: height - 250,
            size: 14,
            font,
            color: goldColor
        });

        // 4. User Details Block (Centered)
        const startY = height - 400;
        const infoX = width / 2;
        page.drawText(profile.name.toUpperCase(), {
            x: infoX - (boldFont.widthOfTextAtSize(profile.name.toUpperCase(), 16) / 2),
            y: startY, size: 16, font: boldFont, color: darkColor
        });

        const dobStr = new Date(profile.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        const birthText = `Born: ${dobStr} at ${profile.timeOfBirth}`;
        page.drawText(birthText, {
            x: infoX - (font.widthOfTextAtSize(birthText, 12) / 2),
            y: startY - 25, size: 12, font, color: grayColor
        });

        const placeText = `${profile.placeOfBirth}`;
        page.drawText(placeText, {
            x: infoX - (font.widthOfTextAtSize(placeText, 12) / 2),
            y: startY - 45, size: 12, font, color: grayColor
        });

        // 5. Generated Date Footer
        const now = new Date();
        const dateFooter = `Report Generated: ${now.toLocaleDateString()}`;
        page.drawText(dateFooter, {
            x: (width - font.widthOfTextAtSize(dateFooter, 10)) / 2,
            y: 50,
            size: 10,
            font: italicFont,
            color: grayColor
        });

        // --- CONTENT PAGES (Page 2+) ---
        page = pdfDoc.addPage();

        // Header Helper for Content Pages
        const addHeader = (p: any, showLogo = true) => {
            const h = p.getSize().height;
            const w = p.getSize().width;

            if (showLogo && logoImage) {
                // Header Logo: Fixed height of 40 units
                const headerH = 40;
                const headerScale = headerH / logoImage.height;
                const headerDims = logoImage.scale(headerScale);

                p.drawImage(logoImage, {
                    x: 50,
                    y: h - 55,
                    width: headerDims.width,
                    height: headerDims.height,
                });
            } else {
                p.drawText('CHETNA', { x: 50, y: h - 50, size: 18, font: boldFont, color: goldColor });
            }

            p.drawText(finalTitle, { x: w - 300, y: h - 40, size: 9, font: boldFont, color: grayColor });
            p.drawText(`Page ${pdfDoc.getPageCount()}`, { x: w - 80, y: h - 40, size: 10, font, color: grayColor });
            p.drawLine({ start: { x: 50, y: h - 60 }, end: { x: w - 50, y: h - 60 }, thickness: 0.5, color: lightGray });
            return h - 90;
        };

        let y = addHeader(page);

        // Chart Visual (Top of Page 2)
        if (embeddedChartImage) {
            // Add Title above chart
            page.drawText(`${chartKey} Chart`, { x: 50, y, size: 16, font: boldFont, color: goldColor });
            y -= 25;

            const dims = embeddedChartImage.scale(0.30);
            // Center it
            const xOffset = (width - dims.width) / 2;
            page.drawImage(embeddedChartImage, {
                x: xOffset,
                y: y - dims.height,
                width: dims.width,
                height: dims.height,
            });
            y -= (dims.height + 40);
        }

        // Helper to check space
        const checkSpace = (needed: number) => {
            if (y < needed) {
                page = pdfDoc.addPage();
                y = addHeader(page);
            }
        };

        // Justify Logic
        const writeSection = (title: string, content: string | any[]) => {
            if (!content) return;
            checkSpace(120);
            page.drawText(title, { x: 50, y, size: 14, font: boldFont, color: goldColor });
            y -= 30;

            if (Array.isArray(content)) {
                for (const section of content) {
                    checkSpace(80);
                    if (section.title) {
                        page.drawText(section.title.toUpperCase(), { x: 50, y, size: 10, font: boldFont, color: goldColor });
                        y -= 18;
                    }
                    if (section.text) {
                        let res = drawJustifiedBlock(page, section.text, 50, y, font, 11, darkColor, width - 100, 18);
                        while (res.pageBreakNeeded) {
                            page = pdfDoc.addPage();
                            y = addHeader(page);
                            y -= 10;
                            res = drawJustifiedBlock(page, res.remainingLines.join('\n'), 50, y, font, 11, darkColor, width - 100, 18);
                        }
                        y = res.y - 12;
                    }
                    y -= 15; // Gap between sections
                }
            } else {
                let res = drawJustifiedBlock(page, content, 50, y, font, 11, darkColor, width - 100, 18);
                while (res.pageBreakNeeded) {
                    page = pdfDoc.addPage();
                    y = addHeader(page);
                    y -= 10;
                    res = drawJustifiedBlock(page, res.remainingLines.join('\n'), 50, y, font, 11, darkColor, width - 100, 18);
                }
                y = res.y - 30;
            }
        };

        // 1. Overview
        if (texts?.definition) writeSection('Overview', texts.definition);

        // 2. Your Story (Personalized)
        if (texts?.story) {
            // Check space or add page
            checkSpace(150);
            page.drawText(`Your Personal Insight for ${profile.name.split(' ')[0]}`, { x: 50, y, size: 14, font: boldFont, color: goldColor });
            y -= 30;

            if (Array.isArray(texts.story)) {
                for (const section of texts.story) {
                    checkSpace(100);
                    // Title
                    if (section.title) {
                        page.drawText(section.title.toUpperCase(), { x: 50, y, size: 10, font: boldFont, color: goldColor });
                        y -= 15;
                    }
                    // Question (Italic)
                    if (section.question) {
                        let res = drawJustifiedBlock(page, section.question, 50, y, italicFont, 10, goldColor, width - 100, 15);
                        while (res.pageBreakNeeded) {
                            page = pdfDoc.addPage();
                            y = addHeader(page);
                            y -= 10;
                            res = drawJustifiedBlock(page, res.remainingLines.join('\n'), 50, y, italicFont, 10, goldColor, width - 100, 15);
                        }
                        y = res.y - 10;
                    }
                    // Text
                    if (section.text) {
                        let res = drawJustifiedBlock(page, section.text, 50, y, font, 11, darkColor, width - 100, 18);
                        while (res.pageBreakNeeded) {
                            page = pdfDoc.addPage();
                            y = addHeader(page);
                            y -= 10;
                            res = drawJustifiedBlock(page, res.remainingLines.join('\n'), 50, y, font, 11, darkColor, width - 100, 18);
                        }
                        y = res.y - 12;
                    }
                    y -= 20; // Gap between story sections
                }
            }
        }

        // 3. Planets Table - FORCE NEW PAGE
        page = pdfDoc.addPage();
        y = addHeader(page);

        page.drawText('Planetary Details', { x: 50, y, size: 14, font: boldFont, color: goldColor });
        y -= 25;

        const introText = `Hello ${profile.name.split(' ')[0]}, this table reveals the precise strength and condition of each planet in your chart. Here you can see which sign each planet occupies and its "Dignity" status (e.g., Exalted, Debilitated, or Friendly).`;
        const introRes = drawJustifiedBlock(page, introText, 50, y, font, 11, darkColor, width - 100, 18);
        y = introRes.y - 30;

        const col1 = 50, col2 = 180, col3 = 280, col4 = 380;
        const drawTableHeader = (p: any, currY: number) => {
            p.drawRectangle({ x: 50, y: currY - 5, width: width - 100, height: 20, color: lightGray });
            p.drawText('Planet', { x: col1 + 5, y: currY, size: 10, font: boldFont });
            p.drawText('Longitude', { x: col2, y: currY, size: 10, font: boldFont });
            p.drawText('Sign', { x: col3, y: currY, size: 10, font: boldFont });
            p.drawText('Dignity', { x: col4, y: currY, size: 10, font: boldFont });
            return currY - 25;
        };
        y = drawTableHeader(page, y);
        const planets = chartData.planets || {};
        const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        for (const p of Object.values(planets) as any[]) {
            if (y < 60) {
                page = pdfDoc.addPage();
                y = addHeader(page);
                y = drawTableHeader(page, y);
            }
            const sign = signs[Math.floor(p.longitude / 30)] || "Unknown";
            const deg = (p.longitude % 30).toFixed(2);
            page.drawText(p.name, { x: col1 + 5, y, size: 10, font });
            page.drawText(`${deg}°`, { x: col2, y, size: 10, font });
            page.drawText(sign, { x: col3, y, size: 10, font });
            page.drawText(p.dignity || "-", { x: col4, y, size: 10, font });
            page.drawLine({ start: { x: 50, y: y - 5 }, end: { x: width - 50, y: y - 5 }, thickness: 0.5, color: lightGray });
            y -= 20;
        }

        // Footer is built-in to addHeader or we can add specific footer
        const pages = pdfDoc.getPages();
        pages.forEach((p, idx) => {
            if (idx > 0) { // Skip title page footer (it has its own)
                const { width } = p.getSize();
                p.drawText('www.chetna.app', { x: 50, y: 15, size: 8, font: italicFont, color: grayColor });
            }
        });

        // Save Record
        await (prisma as any).exportRecord.create({
            data: {
                userId: session?.user?.id || profile.userId,
                chartType: chartKey,
                url: `/api/charts/export?profileId=${profile.id}&chartKey=${chartKey}`
            }
        });

        const pdfBytes = await pdfDoc.save();
        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="Chetna_${chartKey}_Report.pdf"`
            }
        });

    } catch (error) {
        console.error("PDF Generation Error", error);
        return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
    }
}
