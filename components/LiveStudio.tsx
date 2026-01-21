
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { decode, encode, decodeAudioData, createPcmBlob } from '../utils/audio';

const LiveStudio: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const handleStop = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsActive(false);
  }, []);

  const handleStart = async () => {
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputAudioContext = new AudioContext({ sampleRate: 16000 });
      const outputAudioContext = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Process Audio
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const nextTime = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = buffer;
              source.connect(outputAudioContext.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextTime);
              nextStartTimeRef.current = nextTime + buffer.duration;
              sourcesRef.current.add(source);
            }

            // Interrupt logic
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            // Transcription
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscription(prev => [...prev.slice(-10), `You: ${text}`]);
            }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscription(prev => [...prev.slice(-10), `Gemini: ${text}`]);
            }
          },
          onerror: (e) => {
            console.error('Live Error:', e);
            setError("Connection error occurred.");
            handleStop();
          },
          onclose: () => handleStop()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: "You are a friendly Lumina AI assistant. Keep responses brief and conversational."
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      setError(err.message);
      handleStop();
    }
  };

  useEffect(() => {
    return () => handleStop();
  }, [handleStop]);

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Lumina Voice</h2>
        <p className="text-slate-400">Low-latency audio conversation with Gemini 2.5 Native Flash</p>
      </div>

      <div className="w-full h-[400px] bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden flex flex-col shadow-2xl">
        <div className="flex-1 p-6 overflow-y-auto space-y-4 font-mono text-sm">
          {transcription.length === 0 && !error && (
            <div className="h-full flex flex-col items-center justify-center text-slate-600">
               <div className={`w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 ${isActive ? 'animate-pulse' : ''}`}>
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
               </div>
               <p>{isActive ? "Listening and thinking..." : "Ready to speak? Press start."}</p>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
               Error: {error}
            </div>
          )}

          {transcription.map((t, idx) => (
            <div key={idx} className={`p-3 rounded-xl border ${t.startsWith('You:') ? 'bg-indigo-500/10 border-indigo-500/30 ml-auto max-w-[80%]' : 'bg-slate-800 border-slate-700 mr-auto max-w-[80%]'}`}>
              {t}
            </div>
          ))}
        </div>

        <div className="h-2 bg-slate-800 relative">
          {isActive && (
            <div className="absolute inset-0 bg-indigo-500 animate-pulse origin-left"></div>
          )}
        </div>
      </div>

      <button
        onClick={isActive ? handleStop : handleStart}
        className={`
          w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl
          ${isActive 
            ? 'bg-rose-600 hover:bg-rose-500 ring-4 ring-rose-500/20' 
            : 'bg-indigo-600 hover:bg-indigo-500 ring-4 ring-indigo-500/20'}
        `}
      >
        {isActive ? (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><rect width="10" height="10" x="7" y="7" rx="1" /></svg>
        ) : (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z" /></svg>
        )}
      </button>

      <div className="text-xs text-slate-500 text-center max-w-sm">
        Mic is active only when in a session. <br/>
        Real-time audio requires a stable internet connection.
      </div>
    </div>
  );
};

export default LiveStudio;
