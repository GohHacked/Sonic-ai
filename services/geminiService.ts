import { GoogleGenAI, Modality } from "@google/genai";
import { RemixResult } from "../types";

const processAudioRemix = async (
  base64Audio: string, 
  mimeType: string
): Promise<RemixResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });

    // We use the native audio preview model which is capable of audio-in and audio-out.
    // If not available in strict REST, we fall back to a creative description + TTS flow,
    // but the instructions suggest the model exists for "Real-time audio & video conversation tasks".
    // We will attempt to use it via generateContent with Modality.AUDIO.
    
    const modelId = "gemini-2.5-flash-native-audio-preview-09-2025";
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: "Listen to this audio track. I want you to create a short, creative audio improvisation that acts as a 'remix' or 'response' to this track. You can beatbox, hum, or generate synth-like vocal sounds that match the tempo and vibe. Do not speak normal words unless they are part of the song (like lyrics). The output MUST be audio. Be musical."
          }
        ]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Deep voice for bass/beatbox vibes
            },
        },
      }
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find(p => p.inlineData);

    if (!audioPart || !audioPart.inlineData || !audioPart.inlineData.data) {
       // Fallback logic: If the model refused to generate audio directly (sometimes happens with safety filters or model availability),
       // we try to generate a description and then TTS it. This ensures the app always "works".
       console.warn("Primary audio generation failed, switching to text analysis + TTS fallback.");
       return await fallbackRemix(ai, base64Audio, mimeType);
    }

    const audioBase64 = audioPart.inlineData.data;
    const audioBlob = base64ToBlob(audioBase64, 'audio/mp3');
    const audioUrl = URL.createObjectURL(audioBlob);

    return {
      audioUrl,
      description: "AI Audio Remix Generated"
    };

  } catch (error) {
    console.error("Remix generation failed:", error);
    throw error;
  }
};

// Fallback method if direct Audio-to-Audio is restricted or fails
const fallbackRemix = async (ai: GoogleGenAI, base64Audio: string, mimeType: string): Promise<RemixResult> => {
    // 1. Analyze the audio
    const analysisResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
            parts: [
                { inlineData: { mimeType, data: base64Audio } },
                { text: "Analyze this music. Describe the genre, tempo (BPM), and mood. Then, write a short, rhythmic set of lyrics or beatbox sounds (e.g., 'Boom bap, tsh, ka-pow') that would fit perfectly as an overlay remix. Output ONLY the rhythmic text." }
            ]
        }
    });

    const remixText = analysisResponse.text || "Dynamic beatbox rhythm.";

    // 2. TTS the result
    const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: { parts: [{ text: remixText }] },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
            }
        }
    });

    const ttsAudio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!ttsAudio) throw new Error("Failed to generate fallback audio.");

    const audioBlob = base64ToBlob(ttsAudio, 'audio/mp3');
    return {
        audioUrl: URL.createObjectURL(audioBlob),
        description: "Generated via Text-to-Speech Interpretation: " + remixText.substring(0, 50) + "..."
    };
}

const base64ToBlob = (base64: string, type: string) => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type });
};

export { processAudioRemix };
