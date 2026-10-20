# Catalog pose previews

Created 2026-10-20 using the built-in image generation tool with existing catalog photographs as edit targets. The user approved all three retained poses and authorized replacement: “approved. you can replace some of the images with the new poses”. These originals are now integrated through the collection manifests and WebP exports in `public/images/catalog-pose-variants/`. Exact hashes and approval evidence are recorded in `docs/content/catalog-pose-variants/approval.json`.

## Prompt set

Each prompt starts with:

> Edit the provided catalog photograph. Output ONE photorealistic full-body vertical 3:4 kidswear studio photograph, no text, no collage.

The variant-specific instructions follow:

1. `product-020-sky-hands-in-pockets-v1.png` — reference: `public/images/catalog/product-020-sky-model-v1.webp`. Replaces the walking preview, discarded at the user's request.

   This replacement uses the following complete prompt instead of the shared prefix and suffix:

   > Edit the provided catalog photograph. Output ONE photorealistic full-body vertical 3:4 kidswear studio photograph, no text, no collage. Change only the boy's pose: standing casually with BOTH hands comfortably inside the existing side pockets of his sky-blue pants, thumbs naturally visible at the pocket openings, elbows softly bent outward, shoulders relaxed, weight slightly shifted onto one leg, both feet planted. Keep his torso mostly facing the camera, eyes looking at camera and the same warm natural smile. No walking. Preserve the same child's identity, age, facial features, skin tone, hairstyle, body proportions, cream T-shirt tucked into the exact same sky-blue elastic-waist pants, and cream sneakers. Preserve garment colors, fabric, construction, existing pocket placement and full pant length. Keep the waistband unobstructed and the full pants silhouette clearly visible. Preserve the original white seamless studio backdrop, soft bright diffuse lighting, subtle floor shadow, eye-level camera and full-body framing with comfortable margins around head and both shoes. No extra pockets, accessories, props, text or scenery.

2. `product-027-lilac-relaxed-three-quarter-v1.png` — reference: `public/images/catalog/product-027-lilac-model-v1.webp`

   > Change only the child's pose to a relaxed playful three-quarter standing pose, torso rotated about 25 degrees, weight on one leg, other knee softly bent and foot angled out, one hand resting on the hip with elbow gently out and the other arm hanging loosely. Face looking toward camera with a cheerful natural smile. Keep the entire lilac tank front visible, no hands over its fabric. Age-appropriate casual child pose.

3. `product-024-peach-gentle-turn-v1.png` — reference: `public/images/catalog/product-024-peach-teal-cream-model-v1.webp`

   > Change only the child's pose to a gentle playful turning step, body rotated about 25 degrees, face turned toward camera with spontaneous happy smile, arms held loosely slightly away from body, one heel slightly lifted. Dress skirt moves gently with the turn, preserving the original knee-length hem and modest coverage. Keep front bodice, waist seam and star pattern clearly visible. A small natural turn rather than a big twirl.

Each prompt ends with:

> Preserve the same child's identity, age, facial features, skin tone, hairstyle, body proportions, exact outfit, garment colors, fabric, seams, prints and cream shoes from the edit target. Preserve clean white seamless backdrop, soft bright diffuse lighting, subtle floor shadow, eye-level camera and full-body framing with comfortable margins around head and both shoes, consistent with the reference catalog. Clothing fidelity is critical; no redesign, extra accessories, props or scenery. Freeze movement sharply without motion blur.

## Visual review

All three photographs retain full-body framing, white studio backgrounds, and recognizable models and outfits. The boy's replacement has both hands inside the side pockets with thumbs visible, relaxed elbows, and both feet planted; the waistband and pants remain visible. Turning provides movement; the relaxed pose provides an asymmetrical standing option. The relaxed pose's hand partially overlaps the tank despite the prompt. Printed motif placement in the turning dress is regenerated. These visual differences were present in the previews accepted by the user. The walking preview was discarded and is not integrated.
