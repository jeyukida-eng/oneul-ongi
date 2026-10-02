# Illustrated exports
books.image_layout stores auto, single or spread; existing owner RLS applies. Both export screens share this per-book preference. Registration edits preserve it and new books reset to auto.
Export bodies read sanitized bodyHtml/body_html, including image-only chapters. Inline raster drawings remain in protected episode body_html; export adds no public image storage URLs.

For pictureBook works, auto classifies width/height >= 1.25 as a spread; this is a heuristic, not semantic recognition. Authors can override single/spread. The entire image is contained without cropping. Explicit single contains a wide drawing on one portrait page; it does not cut it into halves.
PDF image pages render directly through canvas, preserving aspect ratio. Spreads produce one page twice the selected trim width; these are screen-oriented spreads, not print-ready split leaves. Single is available for separate pages. Illustrated images in regular text books occupy complete portrait pages in manuscript order.
Picture EPUB is pre-paginated with per-document viewport dimensions and rendition:spread none so wide artwork is not split or paired again. Regular EPUB stays reflowable and includes rich HTML images in original order.
Drawings and covers are packaged as PNG resources with manifest entries; no data-URL-only image dependencies remain in EPUB. Title and contents remain included. Cache fingerprints include rich HTML and image layout. Decoded image cache is capped at three images; dimensions remain available.
Export generation rejects a changed manuscript before download.
Notifications and payments are unchanged.

Verification: both web and mobile scripts parse; real PNG decode and native canvas JPEG rendering feed the actual PDF writer. Rendered fixture PDF contains a landscape spread and a portrait page without cropping. XML parsing confirms EPUB images/cover resources, manifest and spine references, fixed-layout metadata and before/image/after reading order. Three studio lists, heart/subscription toggles, stale response and owner isolation tests also pass. Live signed-in browser export was not available.
