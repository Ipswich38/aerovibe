# Waevpoint Letterhead

`Waevpoint-Official-A4-Letterhead.pdf` is the approved A4 letterhead. Every A4
Waevpoint document goes on it: proposals, offers, contracts, invoices, notices.

| File | Role |
|---|---|
| `Waevpoint-Official-A4-Letterhead.pdf` | Approved artwork. Source of truth. |
| `waevpoint-letterhead-a4.png` | Page 1 at 150dpi, the template background. |
| `waevpoint-template.html` | Write the document in this. |
| `waevpoint-sample-offer.html` | A worked example, ready to copy. |
| `HankenGrotesk-var.woff2` | Portable fallback behind system Avenir. |

## Writing a document

Copy `waevpoint-template.html` into a working folder with its PNG and font,
edit inside `<div class="content">`, then Chrome **File > Print > Save as PDF**,
A4, margins **None**, **Background graphics ON** (or the letterhead will not
print).

## Design, measured from the artwork

Dark teal header and footer, white body, all sans (Avenir, no serif). Content
runs **48mm from the top** to **32mm from the bottom**:

```
header band   0     to 36.9mm    #01505e
body          36.9  to 279.2mm   #ffffff
footer band   279.2 to 297mm     #014f5d
```

The footer band is tall, so content stops at 265mm to stay clear of it.

## Known issue

The current artwork prints **`hello@kreativloops.com`** in the header, which is
the Kreativloops email, not a Waevpoint address. Fix this at the source and
re-export before the letterhead is used in earnest. Until then, correct or
remove the email on any document that goes out.

House style: no em dashes, no tildes. Never redraw the logo or bands in markup.

This letterhead is also mirrored in Gawin (`assets/letterhead/waevpoint/`) so it
can generate Waevpoint documents directly.
