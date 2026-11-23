import { property } from "@/lib/property";
import { rooms } from "@/lib/rooms";
import { FAQS } from "@/lib/faq";

/**
 * Verified facts Shire may state. Built from the site's own data (rooms, FAQs,
 * property entity) so the assistant can never drift from what the website says.
 */

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max).trimEnd()}…` : text);

const ROOMS_BLOCK = rooms
  .map(
    (r) =>
      `- ${r.name} (${r.category}) — ${r.size}, ${r.view}, ${r.floor}. Facilities: ${r.facilities.join("; ")}. Page: /rooms/${r.slug}`,
  )
  .join("\n");

const FAQ_BLOCK = FAQS.map((f) => `Q: ${f.question}\nA: ${clip(f.answerText.replace(/\s+/g, " "), 700)}`).join("\n\n");

const NEARBY_BLOCK = property.nearbyPlaces.map((p) => `- ${p.name}: ${p.relation}`).join("\n");

export const KNOWLEDGE = `PROPERTY
- Name: ${property.name} — a family-run boutique homestay (not a hotel chain or resort) in Fagu, near Kufri and Shimla, Himachal Pradesh, India. Altitude about ${property.altitude}, among apple orchards and pine forest, with Himalayan views.
- Address: ${property.address}
- Phone / WhatsApp: ${property.phoneDisplay.join(" or ")} (WhatsApp ${property.phoneDisplay[0]}). Email: ${property.email}
- Seven bedrooms, each with an attached washroom. Any number of rooms can be booked, from one room to all seven. The whole property can be booked together as a private-villa stay for families and groups (page: /private-villa).
- In-house kitchen serving 9am–9pm. Free private parking (up to about 10 SUVs/cars). Wi-Fi, 24/7 hot water, electric heaters, lawn with outdoor seating, terrace balcony with swing, recreation floor (TT, carrom, board games), TV lounge, power back-up.
- Pet-friendly: Rs. 500 per day per pet; guests are responsible for damage or soiling. Details: /pet-policy and /pet-friendly-stay.
- Activities on request/around the property: bonfire and barbecue evenings, guided hiking tours, bird watching, day trips toward Kufri and Shimla. Details: /activities.
- Snow: Fagu typically sees snowfall between December and February, but timing and amount vary and snow on any date is never guaranteed. Even in summer it stays cool; no air conditioner is needed.
- Sustainability practices: waste segregation and recycling, glass bottles instead of plastic, refillable toiletry dispensers, bamboo toothbrushes, on-site composting, rainwater harvesting (page: /sustainability).
- Official online booking link: ${property.bookingUrl}

LOCATION AND DISTANCES (as published by the property)
${NEARBY_BLOCK}

ROOMS
${ROOMS_BLOCK}

FREQUENTLY ASKED QUESTIONS (from the website)
${FAQ_BLOCK}

SITE PAGES YOU MAY LINK TO (use exactly these paths)
/ (home), /private-villa, /activities, /gallery, /faq, /contact, /pet-policy, /pet-friendly-stay, /sustainability, /blog, /blog/best-time-to-visit-fagu, /blog/fagu-snowfall-winter-guide, /blog/why-choose-fagu-for-your-next-holiday, /rooms/deodar, /rooms/buransh, /rooms/chir-pine, /rooms/blue-pine, /rooms/walnut, /rooms/mohru, /rooms/tosh`;
