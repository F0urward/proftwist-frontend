import { api } from "./axios";
import type { Roadmap } from "../types/roadmap";
import { convertRawRoadmap } from "../utils/convertLlmToReactFlow";

export type GenerateRoadmapNodeDescriptionPayload = {
  roadmap_id?: string;
  node_id: string;
  node_label: string;
  node_type?: string;
  current_description?: string;
};

export type GenerateRoadmapPayload = {
  roadmap_id?: string;
  prompt: string;
  provider?: "ollama" | "openai" | "mock";
  model?: string;
};

const cleanJsonResponse = (data: unknown): unknown => {
  if (typeof data !== "string") return data;

  let text = data.trim();
  text = text
    .replace(/^```json\n?/, "")
    .replace(/^```JSON\n?/, "")
    .replace(/^```\n?/, "");
  text = text.replace(/\n?```$/, "").trim();

  try {
    return JSON.parse(text);
  } catch {
    return data;
  }
};

const extractRoadmap = (data: unknown): Roadmap => {
  const cleaned = cleanJsonResponse(data);

  const payload =
    (cleaned as any)?.roadmap ??
    (cleaned as any)?.graph ??
    (cleaned as any)?.generated_roadmap ??
    cleaned;

  if (!payload || typeof payload !== "object") {
    throw new Error("AI service returned an invalid roadmap");
  }

  return convertRawRoadmap(payload as RawRoadmap);
};

interface RawRoadmap {
  nodes?: unknown[];
  edges?: unknown[];
  connections?: unknown[];
}

export const aiService = {
  async generateRoadmap(payload: GenerateRoadmapPayload): Promise<Roadmap> {
    const { data } = await api.post("/ai/roadmap", payload, {
      responseType: "text",
      timeout: 20000,
    });

    return extractRoadmap(data);
  },

  async generateRoadmapNodeDescription(
    payload: GenerateRoadmapNodeDescriptionPayload,
  ): Promise<string> {
    const { data } = await api.post("/ai/roadmap-node-description", payload, {
      responseType: "text",
      timeout: 20000,
    });

    let rawDescription =
      (data as any)?.description ??
      (data as any)?.node_description ??
      (data as any)?.text ??
      data;

    if (typeof rawDescription === "string") {
      rawDescription = rawDescription
        .trim()
        .replace(/^```json\n?/, "")
        .replace(/^```JSON\n?/, "")
        .replace(/^```\n?/, "")
        .replace(/\n?```$/, "")
        .trim();
    }

    const description = rawDescription;

    if (typeof description !== "string") {
      throw new Error("AI service returned an invalid node description");
    }

    return description;
  },
};
