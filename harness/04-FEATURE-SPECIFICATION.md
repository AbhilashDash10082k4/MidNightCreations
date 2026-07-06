# Midnight Creations USA — Complete Feature Specification
**What the finished product looks like — features only, no implementation details.**

---

## A. CUSTOMER ACCOUNT & IDENTITY

1. Guest browsing (no account required to browse or start a quote).
2. Account registration via email/password, Google, Apple, and Facebook login.
3. Email verification and password reset flow.
4. Magic-link ("passwordless") login option.
5. Biometric login on mobile (Face ID / fingerprint) after first sign-in.
6. Unified customer profile: name, email, phone, birthday (for birthday offers), saved sizes, saved addresses, saved payment methods (via secure vault, no raw card storage).
7. Multiple saved shipping/billing addresses with a default address.
8. Order history with reorder ("buy again") on any past order.
9. Saved logos/artwork library for repeat customizers and organizations.
10. Communication preferences center (email/SMS opt-in/out, granular by category: promotions, order updates, fundraiser updates).
11. Account deletion / data export request (privacy self-service).
12. Role-aware experience: the same login can be a "customer," a "fundraiser organizer," or (internally) "staff/admin," each seeing a different set of screens/menus tied to that identity.

---

## B. PRODUCT CATALOG & BROWSING

13. Full product catalog browsing with category and subcategory navigation (e.g., Apparel, Baby, Easter, Mother's Day, Amity, Amity Chamber of Commerce, Town of Orange, Laser Creations, Affirmations & Inspiration — mirroring and expanding today's structure).
14. Category landing pages with curated hero banners, featured products, and descriptive copy per category (community/local storytelling for Amity/Town of Orange lines).
15. Filtering by price range, color, size, style, decoration method, availability, and rating.
16. Sorting by relevance, price (low–high/high–low), newest, best-selling, top-rated.
17. Product grid and list view toggle.
18. Product detail page (PDP) with: image gallery/zoom, multiple angle photos, variant selector (size/color/style shown as swatches or dropdowns matching the option type), live price update per variant, stock/availability indicator, estimated production/shipping time per decoration method, related/alternate categories breadcrumb.
19. On-PDP personalization: add name/number/monogram/text fields, live text preview on the product image, character limits shown, extra cost for personalization shown before adding to cart.
20. "Design your own" flow: upload your own logo/art directly on a product page for custom decoration, with an on-screen placement/size preview.
21. Product bundles/kits (e.g., "Team Starter Pack": shirt + hat + bag) sold as a single purchasable unit with per-item options.
22. Size guide / fit chart per product category (adult unisex, youth, infant) with a size-recommendation helper based on user input (height/weight/previous purchases).
23. Stock status messaging: "in stock," "low stock," "made to order," "restocking on [date]."
24. Back-in-stock notification signup (email/push) for out-of-stock variants.
25. "Frequently bought together" and "customers also bought" modules on the PDP.
26. "You might also like" personalized carousel on PDP, cart, and homepage.
27. Recently viewed products carousel.
28. Product videos/360° views where available.
29. Downloadable/print-ready spec sheet for B2B buyers (dimensions, material, decoration area).

---

## C. SEARCH & DISCOVERY

30. Keyword search with autocomplete/type-ahead suggestions (products, categories, and past searches).
31. Typo-tolerant and synonym-aware search ("hoodie" ≈ "sweatshirt").
32. Natural-language / conversational search ("navy blue hoodie under $40 for a teenager").
33. Visual search: upload or snap a photo of a logo/design/product and find visually similar catalog items.
34. Search results page with the same filtering/sorting as category pages.
35. "No results" page with smart suggestions and a shortcut to the AI assistant or a custom quote request.
36. Trending/popular searches and popular products surfaced on empty search state.
37. Voice search entry point on mobile.

---

## D. CART, CHECKOUT & PAYMENTS

38. Persistent cart (saved across sessions and devices when logged in; local guest cart merges into account cart on login).
39. Cart drawer/mini-cart with quick quantity edit, remove, and save-for-later.
40. Full cart page with subtotal, estimated tax, estimated shipping, discount code entry, and order notes field.
41. Save-for-later / move-to-wishlist from cart.
42. Guest checkout (no account required) and expedited checkout for returning customers.
43. Multiple payment methods: credit/debit card, Apple Pay, Google Pay, PayPal, and buy-now-pay-later option (e.g., Klarna/Afterpay-style).
44. Multiple shipping options at checkout: standard shipping, expedited shipping, and **local pickup at the Orange, CT location**.
45. Real-time shipping cost calculation based on address and cart weight/dimensions.
46. Sales tax calculated automatically by destination.
47. Discount/promo code entry with clear feedback (valid, expired, minimum-not-met, applied amount).
48. Gift card purchase, balance check, and redemption at checkout.
49. Order confirmation page and confirmation email/push notification with order summary.
50. Address autocomplete and validation at checkout to reduce shipping errors.
51. "Buy again" one-click reorder from order history.
52. Abandoned cart recovery messaging (email/SMS/push) for logged-in users who leave items unpurchased.

---

## E. ORDERS, SHIPPING & POST-PURCHASE

53. Order status tracking with clear stages: Order Placed → In Production → Quality Check → Ready for Pickup/Shipped → Delivered.
54. Production-stage visibility specific to a print shop (e.g., "your embroidery is in progress") rather than generic "processing."
55. Shipment tracking number and carrier link surfaced in-app and via email/push.
56. Order detail page: items purchased, personalization details, pricing breakdown, shipping/billing address, payment method used, invoice/receipt download.
57. Self-service order actions where applicable: cancel (if not yet in production), request a change, request a return/exchange.
58. Returns/exchange request flow with reason selection and photo upload for defect claims.
59. Refund status visibility.
60. Post-delivery review request prompt (email/push) with a direct link to leave a review.
61. Reorder reminders for consumable/seasonal items (e.g., annual team merch, holiday items).
62. Customer support contact from any order (chat, email, or "call the shop" tap-to-call on mobile).

---

## F. CUSTOM QUOTE / "REQUEST A QUOTE" WORKFLOW (B2B & bulk orders)

63. "Request a Custom Quote" entry point available site-wide (not just a contact form) for apparel, signage, banners, promo products, and engraving jobs.
64. Guided quote form capturing: organization/contact info, decoration method desired, garment/product type, quantity, colors, design description, needed-by date, and budget range (optional).
65. Multi-file artwork/logo upload (images, PDFs, vector files) attached to the quote.
66. Instant AI-generated **ballpark price range** shown immediately upon submission, clearly labeled as an estimate pending final confirmation.
67. Quote status tracking (Submitted → Under Review → Quoted → Approved → In Production → Complete) visible to the customer.
68. Threaded messaging between the customer and shop staff attached to each quote (no need to leave the platform to email back and forth).
69. Formal itemized quote delivered in-app with line items, unit pricing, and total; customer can approve, request changes, or decline directly.
70. Deposit-based payment option for large orders (pay deposit to start production, balance due before shipment/pickup).
71. Quote-to-order conversion: an approved quote becomes a trackable order automatically, no re-entry of information.
72. Quote history for returning organizations (schools, teams, businesses) to reorder from a past quote.

---

## G. FUNDRAISER / TEAM / SCHOOL "HOST A STORE" PROGRAM

73. Public "Start a Fundraiser/Team Store" application flow with cause/organization details, goals, and desired sale dates.
74. Branded micro-storefront for each approved store: custom name, logo, color theme, and a shareable web link/QR code, distinct from the main storefront but within the same platform.
75. Curated product selection per store (organizer and shop staff jointly choose which products are offered, including store-exclusive designs).
76. Countdown/urgency messaging showing days remaining in the sale window.
77. Supporter checkout experience identical in quality to the main store (cart, guest checkout, payment, shipping/pickup) while browsing under the fundraiser's branding.
78. Organizer dashboard: live sales total, progress toward goal, units sold per product, days remaining, and a supporter leaderboard/thank-you list (optional, privacy-respecting).
79. Auto-generated marketing kit per store: downloadable flyer, QR code, and ready-to-post social media copy/images.
80. Automatic commission/payout calculation and a payout status view for the organizer (pending, processing, paid).
81. Assigned personal account manager shown to the organizer with direct contact info/chat.
82. Store lifecycle automation: pending approval → live → ending-soon reminder → automatically closes on end date → final results & payout summary sent to organizer.
83. Ability to relaunch/clone a past store for a recurring annual fundraiser.
84. Mobile organizer view: check sales and share the store link on the go, push alerts on sales milestones ("You just hit $500 raised!").

---

## H. PROMOTIONAL PRODUCTS / B2B BRAND PORTAL

85. Dedicated business-account experience for repeat corporate/promotional clients.
86. Saved company logo(s) and brand color palette applied automatically across future orders.
87. Bulk quantity pricing tiers shown transparently on eligible products.
88. Multi-user company accounts (e.g., an office manager can order on behalf of a company account with shared billing).
89. Reorder of past promotional runs with one click.

---

## I. AI-POWERED FEATURES (customer-facing)

90. AI shopping assistant chat available site-wide (web and mobile) that can: answer product questions, find products by description, check order status, explain fundraiser stores, and start a custom quote conversationally.
91. AI-drafted quote intake: describing a job in plain language to the assistant pre-fills the structured quote form fields for the customer to confirm.
92. Personalized homepage and PDP recommendations that adapt to browsing/purchase history.
93. "Complete the look" / bundle suggestions during checkout.
94. AI-summarized review highlights ("Customers say: true to size, vibrant print colors, fast shipping") shown at the top of a product's reviews section.
95. AI size/fit suggestion based on the customer's inputs and past orders.
96. AI-assisted design feedback when a customer uploads their own art ("this logo may be too low-resolution for embroidery" style guidance) before they submit a quote.
97. Smart back-in-stock and price-drop alerts personalized to items a customer has shown interest in.

---

## J. REVIEWS, TRUST & COMMUNITY

98. Verified-purchase product ratings and written reviews with photo/video upload.
99. Review helpfulness voting ("Was this helpful?").
100. Q&A section on product pages where customers can ask and shop staff/other customers can answer.
101. Testimonials and case studies (e.g., school/team fundraiser success stories) featured on marketing pages.
102. Social proof badges: "Locally made in Orange, CT," "500+ 5-star reviews," "Trusted by Amity families since [year]."
103. Social media feed integration (Instagram/Facebook) showcasing real customer photos.

---

## K. NOTIFICATIONS & MARKETING

104. Transactional notifications (order confirmation, shipping updates, quote updates, payout updates) via email, SMS, and push — user-controlled per channel.
105. Marketing email signup with a welcome-offer incentive.
106. Abandoned cart and abandoned quote-form recovery messages.
107. Seasonal/local campaign messaging (back-to-school, holiday, Mother's Day, local school spirit weeks) surfaced via banners, email, and push.
108. Referral program: give-a-discount/get-a-discount for inviting friends or a fundraiser's supporter network.
109. Loyalty/rewards program: points on purchases redeemable for discounts, with a visible points balance and reward tiers.
110. Birthday/anniversary personalized offers.
111. Push notification deep-linking straight to the relevant product, order, or fundraiser store.

---

## L. CONTENT, TRUST & INFORMATIONAL PAGES

112. Homepage with rotating featured collections, seasonal promotions, and storytelling about the local/family-run brand.
113. About Us / Our Story page.
114. "How It Works" pages for the quote process and the fundraiser/host-a-store program.
115. FAQ / Help Center with searchable articles.
116. Contact page with store address, hours, phone, email, and an embedded map (Orange, CT location), plus tap-to-call and get-directions on mobile.
117. Shipping, returns, and privacy/terms policy pages.
118. Blog/portfolio section showcasing past custom work and community partnerships.
119. Store locator/pickup info if multiple pickup points ever exist.

---

## M. ADMIN / BACK-OFFICE (STAFF-FACING) — what shop staff and owners see

120. Unified operator dashboard: today's orders, quotes awaiting response, low-stock alerts, active fundraiser stores, and revenue snapshot.
121. Product management: create/edit/archive products, variants, options, images, pricing, and category assignment.
122. Inventory management: stock levels per variant, manual adjustments, low-stock thresholds and alerts.
123. Order management: view/search/filter all orders, update status, print packing slips, issue refunds/cancellations, add internal notes.
124. **Production queue view** organized by decoration method (screen printing, embroidery, sublimation, engraving) showing what needs to be produced, by whom, and by when — a literal shop-floor work queue.
125. Quote management: inbox of incoming quote requests, ability to view attached art, message the customer, build an itemized quote, and convert to an order.
126. Fundraiser store management: approve/reject new store applications, assign account managers, curate store product lists and commission rates, view all-store performance leaderboard, process payouts.
127. Discount/coupon management: create and schedule promo codes, store-specific discounts, and site-wide sales.
128. Customer management: view customer profiles, order history, and support notes; ability to issue store credit.
129. Content/CMS management: edit homepage banners, category page content, blog posts, and policy pages without needing a developer.
130. Reporting & analytics: sales by period/category/store/decoration method, best-sellers, conversion funnel, fundraiser performance leaderboard, quote win-rate, customer lifetime value.
131. Role-based staff accounts (owner/admin, general staff, production staff, account manager) each seeing only the tools relevant to their job.
132. Audit log of key admin actions (who changed a price, who issued a refund, who approved a store).
133. AI admin copilot: ask plain-language questions about the business ("How did the Amity store do compared to last year?") and get an answer, and get AI-drafted responses to routine quote inquiries.

---

## N. MOBILE-APP-SPECIFIC EXPERIENCE (Expo app, in addition to all of the above)

134. Native shopping experience mirroring the website (browse, search, cart, checkout, account, quotes, fundraiser stores).
135. Push notifications for order/quote/fundraiser updates and marketing moments.
136. Camera integration: scan a QR code to jump straight into a specific fundraiser store; photograph a logo/design on the spot to attach to a quote request.
137. Apple Pay / Google Pay one-tap checkout.
138. Biometric app login.
139. "Share" native integration (share a product or fundraiser store link via any installed app — Messages, WhatsApp, Instagram, etc.).
140. Offline-tolerant cart (browsing/cart persists without connectivity and syncs when back online).
141. Widget/quick-action for fundraiser organizers to check sales totals at a glance.
142. Tap-to-call and get-directions shortcuts to the physical shop.

---

## O. TRUST, SAFETY & ACCESSIBILITY (visible to end users)

143. Clear, accessible design usable via screen reader and full keyboard navigation on web.
144. Support for larger text sizes / dynamic type on mobile.
145. Transparent, plain-language privacy controls (what data is collected, how to delete it).
146. Secure checkout indicators (payment is handled by a trusted, PCI-compliant provider — no raw card data ever touches the shop's own systems).
147. Clear content moderation on reviews/Q&A (no visible spam, abuse, or inappropriate uploads).

---

**This is the full end-state feature surface.** Every numbered item above is a
user-visible or staff-visible capability the finished product should have —
nothing here describes how it is built.
