"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onTranscribed: (text: string) => void;
  disabled: boolean;
}

type VoiceState = "idle" | "recording" | "transcribing" | "error";

export default function VoiceInput({ onTranscribed, disabled }: Props) {
  const [state, setState] = useState<VoiceState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Web Speech API（フォールバック）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // OpenAI APIキーの有無をキャッシュ（初回のみ確認）
  const whisperAvailableRef = useRef<boolean | null>(null);

  const checkWhisperAvailable = async (): Promise<boolean> => {
    if (whisperAvailableRef.current !== null) return whisperAvailableRef.current;
    try {
      // 空のPOSTで422かどうかだけ確認（認証エラー401は「キーあり」とみなす）
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: new FormData(),
      });
      whisperAvailableRef.current = res.status !== 422;
    } catch {
      whisperAvailableRef.current = false;
    }
    return whisperAvailableRef.current;
  };

  const startRecording = async () => {
    setErrorMsg("");
    chunksRef.current = [];

    const useWhisper = await checkWhisperAvailable();

    if (!useWhisper) {
      // OpenAI APIキーなし → 最初からWeb Speech APIを使う
      tryWebSpeechAPIOnce();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        stopTimer();
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await transcribeAudio(blob, mimeType);
      };

      recorder.start();
      setState("recording");
      startTimer();
    } catch {
      // マイク権限拒否 or MediaRecorder非対応 → Web Speech APIにフォールバック
      tryWebSpeechAPIOnce();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setState("transcribing");
    }
  };

  const transcribeAudio = async (blob: Blob, mimeType: string) => {
    setState("transcribing");
    const ext = mimeType.includes("ogg") ? "ogg" : "webm";
    const formData = new FormData();
    formData.append("audio", blob, `recording.${ext}`);

    const res = await fetch("/api/transcribe", { method: "POST", body: formData });

    if (res.status === 422) {
      // OpenAI APIキーなし（通常ここには来ない）
      setState("error");
      setErrorMsg("OpenAI APIキーが設定されていません");
      return;
    }

    if (!res.ok) {
      setState("error");
      setErrorMsg("文字起こしに失敗しました");
      return;
    }

    const data = await res.json();
    if (data.text) {
      onTranscribed(data.text);
      setState("idle");
    } else {
      setState("error");
      setErrorMsg("音声を認識できませんでした");
    }
  };

  // Web Speech API フォールバック（Whisper APIキーなし or マイク権限なし時）
  const tryWebSpeechAPIOnce = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognitionAPI = w.SpeechRecognition ?? w.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setState("error");
      setErrorMsg("このブラウザは音声入力に対応していません");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setState("recording");
      startTimer();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      onTranscribed(transcript);
      setState("idle");
      stopTimer();
    };

    recognition.onerror = () => {
      setState("error");
      setErrorMsg("音声認識に失敗しました");
      stopTimer();
    };

    recognition.onend = () => {
      if (state === "recording") setState("idle");
      stopTimer();
    };

    recognition.start();
  };

  const handleClick = () => {
    if (state === "recording") {
      // MediaRecorder使用中は停止
      if (mediaRecorderRef.current?.state === "recording") {
        stopRecording();
      } else if (recognitionRef.current) {
        recognitionRef.current.stop();
        setState("idle");
        stopTimer();
      }
    } else if (state === "idle" || state === "error") {
      startRecording();
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">音声入力</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || state === "transcribing"}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            state === "recording"
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
              : state === "transcribing"
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          {state === "recording" ? (
            <>
              <span className="w-3 h-3 bg-white rounded-sm" />
              停止 {formatTime(seconds)}
            </>
          ) : state === "transcribing" ? (
            <>
              <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              文字起こし中…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V22H8v2h8v-2h-3v-1.06A9 9 0 0 0 21 12v-2h-2z"/>
              </svg>
              録音開始
            </>
          )}
        </button>

        {state === "recording" && (
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="w-1 bg-red-400 rounded-full animate-bounce"
                style={{
                  height: `${8 + i * 4}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {state === "error" && errorMsg && (
        <p className="text-xs text-red-500">{errorMsg}</p>
      )}

      <p className="text-xs text-gray-400">
        録音後に自動で文字起こしされ、テキスト欄に入力されます
      </p>
    </div>
  );
}
