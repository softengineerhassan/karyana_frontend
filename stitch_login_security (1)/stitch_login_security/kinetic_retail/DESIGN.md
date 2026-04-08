```markdown
# Design System Strategy: The Precision Merchant

## 1. Overview & Creative North Star
The Point of Sale (POS) environment is high-stakes and high-velocity. To move beyond the "utilitarian grid" of standard retail software, this design system adopts the Creative North Star of **"Tactile Efficiency."** 

We are not just building a calculator; we are building a high-end instrument. The aesthetic breaks the "template" look by using **Tonal Layering** and **Intentional Asymmetry**. By utilizing a sophisticated charcoal-to-cool-gray foundation, we create a "darkroom" effect where only the most vital data and actions—rendered in Emerald Green—command the eye. We lean into high information density not through clutter, but through structured depth, allowing the merchant to feel in control of a premium, bespoke tool.

---

### 2. Colors: The Tonal Foundation
This system operates on a "Low-Ink" philosophy for structural elements to ensure the hardware-software boundary disappears.

*   **The "No-Line" Rule:** Sectioning must never be achieved with `1px` solid borders. Instead, define zones using background shifts. For example, the product grid (`surface`) sits adjacent to the checkout sidebar (`surface-container-low`). This creates a cleaner, editorial feel that reduces visual noise during long shifts.
*   **Surface Hierarchy & Nesting:** Use the `surface-container` tiers to create "nested" depth.
    *   **Base Layer:** `surface` (#f4f6ff) or `surface-container-lowest` (#ffffff).
    *   **Interactive Regions:** `surface-container` (#dee8ff) for secondary modules.
    *   **Elevated Focus:** `surface-container-highest` (#cdddfe) for active selection states.
*   **The "Glass & Gradient" Rule:** Main CTAs (like "Complete Sale") should utilize a subtle linear gradient from `primary` (#006a32) to `primary_container` (#50fa8c). This adds "soul" and a tactile, pressable quality that flat colors lack. Use `backdrop-blur` (12px-20px) on modal overlays and floating notifications to maintain the sense of a unified, layered workspace.

---

### 3. Typography: Editorial Clarity
We pair the technical precision of **Inter** for data with the sophisticated, wide-set nature of **Manrope** for high-level branding and totals.

*   **Display & Headline (Manrope):** Used for large-scale numbers (Total Amount Due) and section headers. Its geometric nature feels "modern-premium." Use `display-lg` (3.5rem) for the final transaction total to ensure it is legible from a distance.
*   **Body & Label (Inter):** Used for SKU numbers, product names, and UI labels. Inter’s high x-height ensures readability at `body-sm` (0.75rem) even in high-density inventory lists.
*   **Hierarchy Note:** High-contrast weight shifts (e.g., `label-md` in Bold vs. `body-md` in Regular) are preferred over color shifts to maintain accessibility while indicating importance.

---

### 4. Elevation & Depth: Tonal Stacking
Traditional drop shadows are forbidden. We define importance through "Physicality."

*   **The Layering Principle:** To lift a "Quick Action" card, place a `surface-container-lowest` card atop a `surface-container-low` background. The subtle shift from `#ffffff` to `#ecf1ff` provides all the separation the human eye needs without the "dirtiness" of a shadow.
*   **Ambient Shadows:** For floating elements like a "Discount Popover," use a highly diffused shadow: `box-shadow: 0 20px 40px rgba(36, 47, 65, 0.06)`. The tint is derived from `on_surface` to keep it natural.
*   **The "Ghost Border" Fallback:** If a border is required for high-density data tables, use `outline_variant` at 15% opacity. It should feel like a suggestion of a line, not a barrier.

---

### 5. Components

*   **Buttons:**
    *   **Primary ("The Emerald Pulse"):** Uses `primary` (#006a32). For the "Pay" button, use a `xl` (0.75rem) rounded corner.
    *   **Secondary:** Use `secondary_container` with `on_secondary_container` text. No border.
    *   **State:** Hover states should shift to `primary_dim` or `secondary_dim`.
*   **Checkout Cards:** Forbid dividers. Use `2.5` (0.5rem) of vertical spacing and a `surface-container-low` background to group item name, quantity, and price. 
*   **Sidebar Navigation:** An organized, high-density rail using `surface-dim` (#c3d5f8) as the background. Icons should use `on_surface_variant`. The active state is indicated by a vertical pill in `primary` and a background shift to `surface_bright`.
*   **Inventory Chips:** Use `secondary_fixed_dim` for "In Stock" and `error_container` for "Low Stock." Roundedness should be `full` for a soft, approachable feel against the rigid data.
*   **Input Fields:** Use a "Filled" style with `surface_container_high` backgrounds. The bottom-indicator focus should be a `2px` line in `primary`.

---

### 6. Do's and Don'ts

**Do:**
*   **Do** use `Spacing 8` (1.75rem) between major functional zones (e.g., between the Sidebar and the Main Grid).
*   **Do** use `primary_fixed_dim` (#3deb80) for "Success" micro-interactions, like the checkmark after a successful payment.
*   **Do** prioritize `title-lg` for product names in the cart to make them the primary "anchor" for the cashier.

**Don't:**
*   **Don't** use black (#000000). Use `inverse_surface` (#040e1f) for the deepest tones to maintain the "Midnight Blue/Charcoal" sophistication.
*   **Don't** use `none` (0px) roundedness. Even for high-density tools, a minimum of `sm` (0.125rem) is required to avoid a dated, "Windows 95" feel.
*   **Don't** use 100% opaque lines to separate items in a list. Use `surface_variant` backgrounds or white space.

---

### 7. Signature Element: The "Active Layer"
When an item is selected in the POS grid, do not just change the border. Give it a "glow" using a `primary_container` (#50fa8c) subtle inner-shadow and a slight scale-up (1.02x). This tactile feedback makes the professional tool feel responsive and alive under the user's touch.```