# Google Map Style Explorer (apistyle Playground)

Google Map Style Explorer is a tiny experimental **apistyle editor** for Google Maps tiles.

- You paste or type an `apistyle` string into a textbox
- The map on the right updates instantly using those styles
- A few preset styles (Cyberpunk, Fantasy, Witcher, etc.) help you explore what’s possible

🔗 **Live editor:**  https://emresarac.com.tr/google-maps-tile-apistyle-editor/

> Roadmap idea  
> Eventually this will become a full visual style editor (feature selectors, color pickers, rule management).  
> For now, it is a simple but powerful raw apistyle textbox + live preview.

> Important  
> This tool is experimental and based on undocumented Google tile parameters. Not for production use.

---

## What is `apistyle`?

`apistyle` is an **undocumented styling parameter** for Google’s internal tiles endpoint (`https://mt0.google.com/vt/`).  
It works similarly to Google Maps JSON styles, but in a compact inline string format:

- `s.t:<featureType>`
- `s.e:<elementType>`
- `p.<stylerKey>:<value>`

### Format

```
s.t:<feature>|s.e:<element>|p.c:#aarrggbb|p.s:<val>|p.l:<val>
```

Rules are comma-separated.

Example:

```
s.t:0|s.e:l|p.v:off,
s.t:3|s.e:g|p.c:#ff111111|p.w:2
```

---

### Feature Type (`s.t`)

Common IDs (reverse-engineered):

| s.t | Meaning |
|-----|---------|
| 0 | all |
| 5 | landscape |
| 81 | landscape.man_made (buildings) |
| 82 | landscape.natural (forest) |
| 2 | poi |
| 40 | park |
| 3 | road |
| 49 | road.highway |
| 50 | road.arterial |
| 51 | road.local |
| 6 | water |
| 1313 | natural landcover |
| 1314 | natural terrain |

---

### Element Type (`s.e`)

| s.e | Meaning |
|-----|---------|
| g | geometry |
| g.f | geometry.fill |
| g.s | geometry.stroke |
| l | labels |
| l.i | icons |
| l.t | text |
| l.t.f | text fill |
| l.t.s | text stroke |

---

### Styler Parameters (`p.*`)

| Key | Meaning |
|-----|---------|
| p.c | color (#aarrggbb) |
| p.s | saturation |
| p.l | lightness |
| p.v | visibility |
| p.w | weight |
| p.h | hue |
| p.g | gamma |
| p.il | invert_lightness |

Example color:  
`#ff4b5a46` -> fully opaque, RGB 75 90 70

---

### Example Rules

Hide all labels:

```
s.t:0|s.e:l|p.v:off
```

Recolor roads:

```
s.t:3|s.e:g|p.c:#ff8b5a2b|p.w:1
```

Water color:

```
s.t:6|s.e:g|p.c:#ffa3b5c7|p.s:-40
```

---

## How This App Applies Styles

- Your raw input -> cleaned -> URL‑encoded  
- Inserted into tile template:  
  `https://mt0.google.com/vt/lyrs=<layer>&x={x}&y={y}&z={z}&apistyle=<encoded>`  
- Displayed in Leaflet as a live preview  
- “Generated URL” box shows a real tile URL  

---

## Ideas / Roadmap

- Visual rule builder (choose feature -> choose element -> color picker)
- LocalStorage preset saving
- Shareable links with base64-encoded apistyle
- 3×3 tile grid preview
- Legal mode with OSM/MapLibre + JSON styling
