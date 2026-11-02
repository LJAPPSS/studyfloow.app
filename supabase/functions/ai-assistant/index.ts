import { SCHOOL_HOLIDAYS, type SchoolRegion } from "./holidays.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const AI_URL = "https://openrouter.ai/api/v1/chat/completions";
const AI_MODEL = "mistralai/mistral-small-3.2-24b-instruct";
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 2000;

const SYSTEM_PROMPT =
  "Je bent een vriendelijke studieassistent voor een Nederlandse scholier. Antwoord altijd in het Nederlands, " +
  "helder en beknopt. Help met uitleg, oefenvragen en studietips. Geef geen antwoorden die de leerling zelf moet " +
  "maken zonder uitleg te geven.";

type IncomingMessage = { role: "user" | "assistant"; content: string };
type IncomingContext = { today: string; region: SchoolRegion | null };

const REGION_LABELS: Record<SchoolRegion, string> = { noord: "Noord", midden: "Midden", zuid: "Zuid" };
const MONTHS = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function parseContext(value: unknown): IncomingContext | null {
  if (typeof value !== "object" || value === null) return null;
  const { today, region } = value as Record<string, unknown>;
  if (typeof today !== "string" || !ISO_DATE.test(today)) return null;
  if (region !== null && region !== "noord" && region !== "midden" && region !== "zuid") return null;
  return { today, region };
}

function formatDutchDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

function buildHolidayContext({ today, region }: IncomingContext): string {
  if (!region) {
    return "De leerling heeft nog geen schoolvakantieregio ingesteld. Als de leerling naar vakanties vraagt, adviseer dan om de regio (Noord, Midden of Zuid) in de profielinstellingen te kiezen.";
  }
  const regionLabel = REGION_LABELS[region];
  const regional = SCHOOL_HOLIDAYS.filter((holiday) => holiday.regions.includes(region));
  const current = regional.find((holiday) => holiday.start <= today && today <= holiday.end);
  if (current) {
    return `Vandaag is ${formatDutchDate(today)}. De leerling zit nu in de ${current.name} (regio ${regionLabel}, van ${formatDutchDate(current.start)} t/m ${formatDutchDate(current.end)}). Er is geen school, dus de leerling kan de hele dag studeren. Geef concrete tips voor een goede studiedag met regelmatige pauzes en houd rekening met de vakantie.`;
  }
  const next = regional
    .filter((holiday) => holiday.start > today)
    .sort((a, b) => a.start.localeCompare(b.start))[0];
  if (!next) {
    return `Vandaag is ${formatDutchDate(today)}. Er is voor regio ${regionLabel} geen vakantie-informatie meer beschikbaar na de huidige lijst. Zeg dat de leerling de schoolgids moet raadplegen.`;
  }
  return `Vandaag is ${formatDutchDate(today)}. De leerling zit niet in vakantie (regio ${regionLabel}). De volgende vakantie is de ${next.name}, van ${formatDutchDate(next.start)} t/m ${formatDutchDate(next.end)}. Scholen kunnen van deze data afwijken.`;
}

function parseMessages(value: unknown): IncomingMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) return null;
  const messages: IncomingMessage[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) return null;
    const { role, content } = item as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > MAX_MESSAGE_CHARS) return null;
    messages.push({ role, content: trimmed });
  }
  if (messages[messages.length - 1].role !== "user") return null;
  return messages;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") return json({ error: "Methode niet toegestaan." }, 405);

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) return json({ error: "De AI-assistent is nog niet geconfigureerd." }, 503);

    const body = await req.json().catch(() => null);
    const messages = parseMessages(body?.messages);
    if (!messages) return json({ error: "Ongeldig bericht. Probeer het opnieuw." }, 400);
    const context = parseContext(body?.context);
    if (!context) return json({ error: "Ongeldige context. Probeer het opnieuw." }, 400);

    const upstream = await fetch(AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT} ${buildHolidayContext(context)}` },
          ...messages,
        ],
        temperature: 0.4,
        max_tokens: 800,
      }),
    });

    if (!upstream.ok) {
      console.error("AI request failed", upstream.status, await upstream.text());
      return json({ error: "De AI-assistent is nu niet bereikbaar. Probeer het later opnieuw." }, 502);
    }

    const result = await upstream.json();
    const reply = result?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return json({ error: "De AI gaf een onverwacht antwoord. Probeer het opnieuw." }, 502);
    }

    return json({ reply: reply.trim() });
  } catch (err) {
    console.error("ai-assistant error", err);
    return json({ error: "Er ging iets mis. Probeer het opnieuw." }, 500);
  }
});

