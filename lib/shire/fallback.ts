import { brand } from "@/lib/content";
import { property } from "@/lib/property";
import { rooms } from "@/lib/rooms";
import { FAQS } from "@/lib/faq";

/**
 * Offline answers used when the free AI endpoints are busy or down. Matches the
 * visitor's question against the site's own FAQ and a few curated topics, so
 * Shire still gives a correct, on-site answer instead of an error. Returns null
 * when nothing matches well enough (the UI then offers WhatsApp).
 */

const STOP = new Set(
  "a an the is are was were be do does did can could will would should you your we our i me my to of in on at for from with and or but if it its this that there any have has how what when where which who whom why please tell about us get need want know".split(" "),
);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t))
    .map((t) => (t.length > 4 && t.endsWith("s") ? t.slice(0, -1) : t));
}

type Entry = { question: string; answer: string; keywords: string[] };

const wa = brand.phoneDisplay[0];

const CURATED: Entry[] = [
  {
    question: "Booking, rates and availability",
    keywords: ["book", "booking", "reserve", "reservation", "price", "rate", "tariff", "cost", "charge", "available", "availability", "offer", "discount", "stay"],
    answer: `Rates and availability depend on your dates, the rooms you choose and your group size, so the team confirms them directly. You can book online at ${property.bookingUrl}, or message us on WhatsApp / call ${brand.phoneDisplay.join(" or ")} with your dates and group size and we'll reply with availability and a plan.`,
  },
  {
    question: "Contact details",
    keywords: ["contact", "phone", "number", "call", "email", "mail", "whatsapp", "reach", "talk"],
    answer: `You can call or WhatsApp us on ${brand.phoneDisplay.join(" or ")}, or email ${brand.email}. The quickest way is WhatsApp.`,
  },
  {
    question: "Location and address",
    keywords: ["address", "location", "located", "directions", "map", "reach", "far", "distance", "shimla", "kufri", "fagu", "route"],
    answer: `We're at ${brand.address}. The property is about 5 km ahead of Kufri and 19 km ahead of Shimla on the main highway towards Theog / Narkanda, then 2 km on the link road from Fagu. Map: ${brand.mapsUrl}`,
  },
  {
    question: "Rooms",
    keywords: ["room", "rooms", "bedroom", "suite", "deodar", "buransh", "chir", "pine", "blue", "walnut", "mohru", "tosh", "premium", "deluxe", "standard"],
    answer: `We have seven bedrooms, each with an attached washroom: Premium — ${rooms.filter((r) => r.category.startsWith("Premium")).map((r) => r.name).join(", ")}; Deluxe — ${rooms.filter((r) => r.category.startsWith("Deluxe")).map((r) => r.name).join(", ")}; Standard — ${rooms.filter((r) => r.category.startsWith("Standard")).map((r) => r.name).join(", ")}. You can book anything from one room to the whole property. See each room at ${property.url}#rooms`,
  },
  {
    question: "Snow and weather",
    keywords: ["snow", "snowfall", "winter", "weather", "cold", "temperature", "season", "summer", "month", "best", "time"],
    answer: `Fagu typically sees snowfall between December and February, but timing and amount vary every year, so snow on a particular date can't be guaranteed. It stays cool even in summer. See our guides: ${property.url}blog/fagu-snowfall-winter-guide and ${property.url}blog/best-time-to-visit-fagu`,
  },
  {
    question: "Pets",
    keywords: ["pet", "pets", "dog", "dogs", "cat", "puppy", "animal"],
    answer: `Yes, we're pet-friendly. The fee is Rs. 500 per day per pet, and guests are responsible for any damage or soiling. Full rules: ${property.url}pet-policy`,
  },
  {
    question: "Food",
    keywords: ["food", "meal", "meals", "breakfast", "lunch", "dinner", "kitchen", "restaurant", "veg", "eat", "chef"],
    answer: `We have an in-house kitchen serving from 9am to 9pm. Barbecue and bonfire evenings can be arranged on request. For menus and meal plans, message the team on WhatsApp (${wa}).`,
  },
];

const ENTRIES: Entry[] = [
  ...CURATED,
  ...FAQS.map((f) => ({ question: f.question, answer: f.answerText.replace(/\s+/g, " ").trim(), keywords: tokens(f.question) })),
];

const MIN_SCORE = 2;

export function answerFromKnowledge(question: string): string | null {
  const q = new Set(tokens(question));
  if (q.size === 0) return null;

  let best: { entry: Entry; score: number } | null = null;
  for (const entry of ENTRIES) {
    let score = 0;
    for (const k of entry.keywords) if (q.has(k)) score += 2;
    // Weaker signal: overlap with the answer text itself.
    const body = new Set(tokens(entry.answer));
    for (const t of q) if (body.has(t)) score += 0.5;
    if (!best || score > best.score) best = { entry, score };
  }
  if (!best || best.score < MIN_SCORE) return null;
  return best.entry.answer.slice(0, 900);
}
