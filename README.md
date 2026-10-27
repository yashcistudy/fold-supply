# Fold Supply

**A shop where the room is the website.** Self-initiated brand and e-commerce project by [Yas Dastan](https://yashcistudy.github.io/yas-dastan/).

**Live:** https://yashcistudy.github.io/fold-supply/

> Fold Supply is a fictional brand. Nothing is for sale, no payment is taken and nothing is sent. Product photos are AI-generated concept renders. The 3D products are modelled to the sizes listed in the brief.

---

## The brief

A UK shop for three desk accessories, for people whose desk is also where they live in the evening.

| Product | Size | Price |
|---|---|---|
| Desk Mat | 700 × 350 × 3 mm compressed polyester felt | £28 |
| Folding Laptop Stand | 250 × 220 mm open, 110 mm rear height, folds to 22 mm | £49 |
| Cable Clips Pair | 44 × 20 × 12 mm, 3 channels each | £9 |
| Desk Set | All three | £76 (£86 separately) |

Delivery is £4.95, or free from £75.

## Three lenses, in order

### 1. E-commerce UX
- **Every template in the brief is a place in the room.** The notebook holds help and care, the framed print holds our approach, the window holds delivery and returns, and the kraft box holds the bag. The bar along the bottom names every section in plain words, so nobody has to guess what a notebook means.
- **Sizes come before prices** on every product sheet.
- **The set is offered at the right moment.** A bag holding all three items offers to swap them for the Desk Set and save £10.
- **Failure recovery:** a part postcode at checkout gets a field-level error in words and colour, with an icon, and focus moves to it.
- **Order placed:** the box lid closes, the folded-stop sticker seals it, the lamp comes on. *That's work done.*

### 2. Brand identity
- **One move: the fold.** The folded full stop is the mark. It also seals the box, marks the selected tab and sits on the corner of each sheet.
- **Colours are materials:** Studio, Graphite, Felt, Silver, Kraft. Lamp amber only appears after six.
- **Type:** Chillax for names, Gentium Book Plus for reading and prices.
- **Honest claims only:** no recycled-content, carbon or lifetime claims.

### 3. The 3D experience
- **Live three.js products composited into a still image of a room.** The camera is solved from the image with OpenCV (3.4 px error) so the 3D and the image line up.
- **Lit by an HDRI of a room,** with contact shadows and an invisible desk that hides what should be hidden.
- **Scrolling is a working day,** from 08:55 to 18:00. The mat unrolls, the stand opens, the cables clip in, and in the evening everything is put away.
- **The products are real mechanisms:** the stand's scissor hinge, the mat's roll, the clips' channels. The fold control's ruler ticks sit where the stand actually reaches each height.

## Try this
1. Scroll the desk from morning to evening.
2. Open the **Stand** and drag the ruler from 22 to 110 mm.
3. Open the **Mat** and roll it. Everything else lifts out of the way.
4. Add all three products, open the box, and take the Desk Set swap.
5. At checkout, enter `LS1` as the postcode, then fix it.

## Built with
three.js r160, plain HTML, CSS and JavaScript, no build framework. Built with Claude Code as the development partner.

## Your details
The designer name, email and website address live in **`config.js`** at the top of the repo. Edit that one file and the intro, Contact and About pages all update.

## Source
`index.html` is the whole site, generated from `source/`:

```
python3 source/tools/build2.py   # rebuilds index.html from source/parts
```

- `source/base-scene.html`: the earlier 3D scene the product models come from
- `source/parts/`: the page shell, scene, product view and room pages
- `source/tools/cal.json`: the solved camera; `calib.py` is the solver

## Credits
- Lighting: [Hotel Room](https://polyhaven.com/a/hotel_room) HDRI by Greg Zaal, Poly Haven (CC0)
- Material textures: [Caban](https://polyhaven.com/a/caban), Poly Haven (CC0) and [Metal Substance 005](https://ambientcg.com/view?id=MetalSubstance005), ambientCG (CC0)
- Room image and product photos: AI-generated concept images
- Typefaces: Chillax (Indian Type Foundry, via Fontshare), Gentium Book Plus (SIL, Open Font License)
- 3D library: three.js (MIT)
