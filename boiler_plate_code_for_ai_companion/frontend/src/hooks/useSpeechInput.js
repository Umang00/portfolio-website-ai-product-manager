// useSpeechInput.js
import { useState, useEffect, useRef, useCallback } from "react";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

export function useSpeechInput({ onResult, lang = "en-US" } = {}) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(!!SpeechRecognition);
  const [permission, setPermission] = useState("prompt");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);

  /**
   * Simple post‐processor to capitalize & punctuate final results
   */
  function punctuate(text) {
    // capitalize first letter
    text = text.charAt(0).toUpperCase() + text.slice(1);
    // add a period if missing
    if (!/[.!?]$/.test(text.trim())) text += ".";
    return text;
  }

  // keep the ref up to date
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (!SpeechRecognition) {
      console.warn("[useSpeechInput] not supported");
      setSupported(false);
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = lang;

    recog.onstart = () => setListening(true);
    recog.onend = () => setListening(false);

    recog.onresult = (evt) => {
      const result = evt.results[evt.resultIndex];
      const text = punctuate(result[0].transcript.trim());
      const isFinal = result.isFinal;
      onResultRef.current(text, isFinal);
      if (isFinal) recog.stop();
    };

    recog.onerror = (e) => {
      setError(e.error);
      if (/not-allowed|service-not-allowed/.test(e.error)) {
        setPermission("denied");
      }
      recog.stop();
    };

    recognitionRef.current = recog;

    // check microphone permission once
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "microphone" })
        .then((status) => {
          setPermission(status.state);
          status.onchange = () => setPermission(status.state);
        })
        .catch(() => {});
    }

    return () => {
      recog.abort?.();
      recog.onstart = recog.onresult = recog.onerror = recog.onend = null;
    };
  }, [lang]); // <-- only re-run if language changes

  const start = useCallback(async () => {
    if (!supported || listening) return;

    if (permission === "prompt" && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((t) => t.stop());
        setPermission("granted");
      } catch {
        setPermission("denied");
        return;
      }
    }

    try {
      recognitionRef.current.start();
    } catch (err) {
      setError(err.message || err);
    }
  }, [supported, listening, permission]);

  const stop = useCallback(() => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
    }
  }, [listening]);

  return { listening, supported, permission, error, start, stop };
}
