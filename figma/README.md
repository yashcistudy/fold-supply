# Fold Supply design file: Figma plugin

This plugin builds the whole Fold Supply design record in an empty Figma file. It makes 10 pages:

| Page | What's on it |
|---|---|
| 00 Cover | Title, hero screen, credit, live link |
| 01 Brief | Catalogue, commerce rules, templates, weightings, voice, research |
| 02 Process | Steps 01–24: what happened, and the decision each time (Yas's calls highlighted) |
| 03 Foundations | Colour variables (Day and Evening themes), 14 text styles, the folded full stop, wordmarks, icons, spacing |
| 04 Components | 17 component sets with variants: button, chip, pin, subtitle, mobile guide card, band, fold control, view tabs, spec row, shop row, bag row, swap offer, totals, field, toast, day rail, intro card |
| 05 Page sheets | Product, shop, bag, checkout error, order placed, help, all built from component instances |
| 06 Flows | Buying the Desk Set, and recovering from a postcode error |
| 07 Screens · Desktop | 24 screens at 1440 × 900, captured from the live build, with notes |
| 08 Screens · Mobile | 9 screens at 390 × 844 |
| 09 Credits and disclosure | Ownership, fictional brand, how it was made, image and asset credits |

The colours, type, components and page sheets are real, editable Figma layers. The screens are captures of the live site, because the 3D room can't be rebuilt in Figma. They load from `figma/shots/` on the GitHub Pages site, so you need an internet connection while the plugin runs.

## Before you start
1. **Use the Figma desktop app.** Figma only lets you add a plugin from a file on your computer in the desktop app. Download it from figma.com/downloads.
2. **Install Chillax.** It's free from Fontshare (fontshare.com/fonts/chillax). Install the font files on your computer, then restart Figma. Gentium Book Plus is a Google Font and is already in Figma. Without Chillax, the plugin uses Inter instead and leaves a note on the cover.

## Add the plugin
1. Unzip `fold-supply-figma-plugin.zip`. You'll get a folder with `manifest.json` and `code.js`.
2. In the Figma desktop app, open **Drafts** and create a **new design file**.
3. In the top-left menu, choose **Plugins → Development → Import plugin from manifest…**, then pick the `manifest.json` file in the folder.

## Run it
1. In the same file, choose **Plugins → Development → Fold Supply · Design file**.
2. Wait about a minute. Progress messages appear at the bottom of the screen. When it says **Done: 10 pages built**, it's finished.
3. Run it **once per empty file**. Running it twice in the same file makes duplicate pages, styles and variables.

## Sharing it
- **A link:** Share → set to *Anyone with the link can view* → Copy link.
- **Images for Upwork or Fiverr:** select a frame and export it as PNG at 2x.
- **A PDF:** File → Export frames to PDF.

## Changing the text
Everything is editable once it's in Figma. To change what the plugin writes, edit `plugin-source/code.template.js`. Then ask Claude to rebuild `code.js`, because the build inlines the brand SVGs.
