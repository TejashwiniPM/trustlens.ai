import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Radio,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Convert Float32Array PCM (-1 to 1) to Base64 16-bit PCM little-endian
function floatTo16BitPCMBase64(float32Array: Float32Array): string {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 16-bit PCM little-endian to Float32Array
function base64ToFloat32(base64: string): Float32Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const view = new DataView(bytes.buffer);
  const numSamples = Math.floor(len / 2);
  const float32 = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const int16 = view.getInt16(i * 2, true);
    float32[i] = int16 < 0 ? int16 / 0x8000 : int16 / 0x7fff;
  }
  return float32;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({ isOpen, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcriptHints, setTranscriptHints] = useState<string[]>([
    "Try saying: 'I received a message claiming to be from FedEx asking for a $3 re-delivery fee. What should I check?'",
    "Or say: 'Someone on WhatsApp says they are my daughter with a new number asking for rent money.'",
  ]);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isMutedRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (!isOpen) {
      stopSession();
    }
  }, [isOpen]);

  const startSession = async () => {
    try {
      setErrorMessage(null);
      setIsConnecting(true);

      // Check microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      // WebSocket connection to server Live API bridge
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Audio contexts: input at 16kHz, output at 24kHz
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      inputAudioCtxRef.current = inputCtx;

      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      outputAudioCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      // Setup microphone stream processor
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current || ws.readyState !== WebSocket.OPEN) return;
        const channelData = e.inputBuffer.getChannelData(0);

        // Simple volume detection for visual animation
        let sum = 0;
        for (let i = 0; i < channelData.length; i++) {
          sum += Math.abs(channelData[i]);
        }
        const avg = sum / channelData.length;
        setUserSpeaking(avg > 0.015);

        const base64Audio = floatTo16BitPCMBase64(channelData);
        ws.send(JSON.stringify({ audio: base64Audio }));
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            setErrorMessage(msg.error);
            stopSession();
            return;
          }

          if (msg.interrupted) {
            // Stop active audio immediately
            activeSourcesRef.current.forEach((src) => {
              try {
                src.stop();
              } catch {}
            });
            activeSourcesRef.current = [];
            if (outputAudioCtxRef.current) {
              nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
            }
            setIsSpeaking(false);
            return;
          }

          if (msg.audio && outputAudioCtxRef.current) {
            setIsSpeaking(true);
            const floatData = base64ToFloat32(msg.audio);
            const audioBuffer = outputAudioCtxRef.current.createBuffer(
              1,
              floatData.length,
              24000
            );
            audioBuffer.getChannelData(0).set(floatData);

            const sourceNode = outputAudioCtxRef.current.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.connect(outputAudioCtxRef.current.destination);

            const ctxTime = outputAudioCtxRef.current.currentTime;
            const startTime = Math.max(ctxTime, nextStartTimeRef.current);
            sourceNode.start(startTime);
            nextStartTimeRef.current = startTime + audioBuffer.duration;

            activeSourcesRef.current.push(sourceNode);
            sourceNode.onended = () => {
              activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== sourceNode);
              if (activeSourcesRef.current.length === 0) {
                setIsSpeaking(false);
              }
            };
          }
        } catch (parseErr) {
          console.error('Error handling WebSocket message:', parseErr);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket live audio error:', err);
        setErrorMessage('Connection to Live voice session failed. Please ensure Gemini API is configured.');
        setIsConnecting(false);
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };
    } catch (err: any) {
      console.error('Microphone or connection error:', err);
      setErrorMessage(err?.message || 'Could not access microphone.');
      setIsConnecting(false);
      setIsConnected(false);
    }
  };

  const stopSession = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    setUserSpeaking(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div
        className="bg-[#091129] rounded-2xl border border-blue-900/60 shadow-2xl shadow-black/80 w-full max-w-xl flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-blue-950 bg-[#070d20] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 via-indigo-600 to-blue-700 p-px shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#081028] rounded-[11px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-display">
                  Live Voice Advisor
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time conversational audio with Google Gemini Live API
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopSession();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-blue-950/60 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Visualizer Area */}
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-6 bg-linear-to-b from-[#070e24] via-[#09122f] to-[#060a1a]">
          {/* Animated Orb / Audio Indicator */}
          <div className="relative flex items-center justify-center">
            {/* Outer pulsating rings */}
            {(isConnected || isConnecting) && (
              <>
                <div
                  className={`absolute w-44 h-44 rounded-full border border-cyan-500/30 transition-all duration-300 ${
                    isSpeaking
                      ? 'scale-125 animate-ping opacity-30 bg-cyan-500/10'
                      : userSpeaking
                      ? 'scale-110 animate-pulse opacity-40 bg-indigo-500/10'
                      : 'opacity-10'
                  }`}
                />
                <div
                  className={`absolute w-36 h-36 rounded-full border border-blue-500/40 transition-all duration-500 ${
                    isSpeaking
                      ? 'scale-115 animate-pulse bg-cyan-500/20'
                      : userSpeaking
                      ? 'scale-105 bg-indigo-500/20'
                      : 'opacity-20'
                  }`}
                />
              </>
            )}

            {/* Central glowing core */}
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative z-10 ${
                isSpeaking
                  ? 'bg-linear-to-tr from-cyan-500 to-blue-600 shadow-cyan-500/50 scale-105'
                  : userSpeaking
                  ? 'bg-linear-to-tr from-indigo-500 to-purple-600 shadow-purple-500/50 scale-105'
                  : isConnected
                  ? 'bg-linear-to-tr from-cyan-900 to-blue-950 border-2 border-cyan-500/50'
                  : 'bg-[#0d1633] border border-blue-900/60'
              }`}
            >
              {isSpeaking ? (
                <Volume2 className="w-10 h-10 text-white animate-bounce" />
              ) : isConnected ? (
                isMuted ? (
                  <MicOff className="w-10 h-10 text-rose-400" />
                ) : (
                  <Mic className="w-10 h-10 text-cyan-300 animate-pulse" />
                )
              ) : (
                <Radio className="w-10 h-10 text-slate-500" />
              )}
            </div>
          </div>

          {/* Connection Status Label */}
          <div>
            <div className="text-sm font-bold tracking-wide">
              {isConnecting ? (
                <span className="text-cyan-300 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Connecting to Gemini 3.8 Live...
                </span>
              ) : isConnected ? (
                isSpeaking ? (
                  <span className="text-cyan-300 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    Gemini Live is speaking...
                  </span>
                ) : userSpeaking ? (
                  <span className="text-emerald-300 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Listening to you...
                  </span>
                ) : isMuted ? (
                  <span className="text-amber-400">Microphone muted</span>
                ) : (
                  <span className="text-slate-300">Listening... Speak naturally anytime</span>
                )
              ) : (
                <span className="text-slate-400">Voice session inactive</span>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {isConnected
                ? 'Speak naturally about any suspicious message, urgent caller, or payment request. Gemini responds with spoken audio in real time.'
                : 'Click "Start Conversation" to begin an interactive voice session with Gemini 3.8 Live.'}
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/60 text-xs text-rose-200 flex items-center gap-2 max-w-md text-left">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Transcript / Suggestion Prompts */}
          <div className="w-full bg-[#070e24] p-3.5 rounded-xl border border-blue-900/50 text-left space-y-1.5 text-xs text-slate-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
              Sample Voice Queries:
            </span>
            {transcriptHints.map((hint, i) => (
              <p key={i} className="text-slate-400 italic">
                • {hint}
              </p>
            ))}
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="p-4 sm:p-5 bg-[#070d20] border-t border-blue-950 flex flex-wrap items-center justify-between gap-3">
          {isConnected ? (
            <>
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                  isMuted
                    ? 'bg-rose-950 text-rose-200 border border-rose-800'
                    : 'bg-[#0e193b] text-slate-200 hover:text-white border border-blue-900/60'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-cyan-400" />}
                <span>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
              </button>

              <button
                type="button"
                onClick={stopSession}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-900/40 min-h-[44px] cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Requires microphone access
              </span>

              <button
                type="button"
                onClick={startSession}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-linear-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white transition-all shadow-lg shadow-cyan-500/25 min-h-[46px] cursor-pointer active:scale-98"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-cyan-200" />
                    <span>Start Voice Conversation</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
