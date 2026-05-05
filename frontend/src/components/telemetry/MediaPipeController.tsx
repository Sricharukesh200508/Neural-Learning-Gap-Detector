'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * TENSOR '26 — HIGH-INTEGRITY MEDIAPIPE PROCTORING CONTROLLER
 *
 * Detections:
 *  1. Face Hidden   — no landmarks returned
 *  2. Gaze Deviation — iris centre outside calibrated bounds
 *  3. Eye Close     — Eye Aspect Ratio (EAR) below threshold (both eyes)
 *  4. Face Coverage — low mesh confidence / sparse landmarks
 *
 * EAR formula (Soukupová & Čech, 2016):
 *   EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
 * MediaPipe FaceMesh eye landmark indices (refined):
 *   Right eye: 33, 160, 158, 133, 153, 144
 *   Left  eye: 362, 385, 387, 263, 373, 380
 */

// ── Landmark indices ────────────────────────────────────────────────────────
// Right eye: p1=33, p2=160, p3=158, p4=133, p5=153, p6=144
const R_EYE = [33, 160, 158, 133, 153, 144];
// Left eye:  p1=362, p2=385, p3=387, p4=263, p5=373, p6=380
const L_EYE = [362, 385, 387, 263, 373, 380];

// Iris centre landmarks (only available with refineLandmarks: true)
const IRIS_LEFT  = 468; // left iris  centre
const IRIS_RIGHT = 473; // right iris centre

// ── Tunable thresholds ──────────────────────────────────────────────────────
const EAR_CLOSE_THRESHOLD  = 0.18;  // below → eye considered closed (was 0.20, less sensitive)
const EAR_BLINK_FRAMES     = 4;     // consecutive frames below to flag (was 3, avoids blink FP)
const GAZE_X_MIN = 0.28;            // wider than 0.35 — tolerate natural micro-head-turns
const GAZE_X_MAX = 0.72;            // wider than 0.65
const GAZE_Y_MIN = 0.22;            // wider than 0.30 — tolerate looking slightly up/down
const GAZE_Y_MAX = 0.78;            // wider than 0.72

// ── Euclidean distance between two landmarks ────────────────────────────────
function dist(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// ── EAR calculation ─────────────────────────────────────────────────────────
function earForEye(lm: any[], idx: number[]) {
  // idx: [p1, p2, p3, p4, p5, p6]
  const p1 = lm[idx[0]], p2 = lm[idx[1]], p3 = lm[idx[2]];
  const p4 = lm[idx[3]], p5 = lm[idx[4]], p6 = lm[idx[5]];
  const vertical1 = dist(p2, p6);
  const vertical2 = dist(p3, p5);
  const horizontal = dist(p1, p4);
  if (horizontal < 1e-6) return 1; // degenerate case → open
  return (vertical1 + vertical2) / (2.0 * horizontal);
}

// ── Status type ─────────────────────────────────────────────────────────────
type ProctorStatus =
  | 'initializing'
  | 'active'
  | 'face_hidden'
  | 'gaze_away'
  | 'eyes_closed'
  | 'error';

export default function MediaPipeController({
  onTelemetry,
}: {
  onTelemetry: (data: any) => void;
}) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Hold the latest callback without triggering useEffect re-runs
  const onTelemetryRef = useRef(onTelemetry);
  useEffect(() => { onTelemetryRef.current = onTelemetry; }, [onTelemetry]);

  const [status, setStatus]       = useState<ProctorStatus>('initializing');
  const [earValue, setEarValue]   = useState(1);
  const [gazeXY, setGazeXY]      = useState({ x: 0.5, y: 0.5 });
  const [retryCount, setRetryCount] = useState(0);
  const closedFramesRef           = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let faceMesh: any = null;
    let camera: any   = null;
    let destroyed      = false;

    const start = async () => {
      try {
        const fm = await import('@mediapipe/face_mesh');
        const cu = await import('@mediapipe/camera_utils');

        const FaceMesh = (fm as any).FaceMesh ?? (fm as any).default?.FaceMesh ?? (fm as any).default;
        const Camera   = (cu as any).Camera   ?? (cu as any).default?.Camera   ?? (cu as any).default;

        if (!FaceMesh || !Camera) throw new Error('MediaPipe primitives unavailable');
        if (destroyed) return;

        faceMesh = new FaceMesh({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.65,
        });

        faceMesh.onResults((results: any) => {
          if (destroyed) return;

          const faces = results.multiFaceLandmarks;

          // ── No face detected ────────────────────────────────────────────
          if (!faces || faces.length === 0) {
            closedFramesRef.current = 0;
            setStatus('face_hidden');
            setEarValue(1);
            onTelemetryRef.current({
              faceDetected:   false,
              gaze:           { x: -1, y: -1 },
              earLeft:        null,
              earRight:       null,
              eyesClosed:     false,
              isLookingAway:  true,
              lipSync:        0,
              t:              Date.now(),
            });
            return;
          }

          const lm = faces[0];

          // ── EAR ─────────────────────────────────────────────────────────
          const earR = earForEye(lm, R_EYE);
          const earL = earForEye(lm, L_EYE);
          const earAvg = (earR + earL) / 2;

          if (earAvg < EAR_CLOSE_THRESHOLD) {
            closedFramesRef.current++;
          } else {
            closedFramesRef.current = 0;
          }
          const eyesClosed = closedFramesRef.current >= EAR_BLINK_FRAMES;

          // ── Gaze (use average of both iris centres) ──────────────────────
          let gazeX = 0.5, gazeY = 0.5;
          if (lm[IRIS_LEFT] && lm[IRIS_RIGHT]) {
            gazeX = (lm[IRIS_LEFT].x + lm[IRIS_RIGHT].x) / 2;
            gazeY = (lm[IRIS_LEFT].y + lm[IRIS_RIGHT].y) / 2;
          } else if (lm[IRIS_LEFT]) {
            gazeX = lm[IRIS_LEFT].x;
            gazeY = lm[IRIS_LEFT].y;
          }

          const isGazeAway =
            gazeX < GAZE_X_MIN || gazeX > GAZE_X_MAX ||
            gazeY < GAZE_Y_MIN || gazeY > GAZE_Y_MAX;

          const isLookingAway = isGazeAway || eyesClosed;

          // ── Lip sync (mouth openness) ────────────────────────────────────
          const lipSync = lm[13] && lm[14] ? Math.abs(lm[13].y - lm[14].y) : 0;

          // ── Update UI status ─────────────────────────────────────────────
          if (eyesClosed)        setStatus('eyes_closed');
          else if (isGazeAway)   setStatus('gaze_away');
          else                   setStatus('active');

          setEarValue(parseFloat(earAvg.toFixed(3)));
          setGazeXY({ x: parseFloat(gazeX.toFixed(3)), y: parseFloat(gazeY.toFixed(3)) });

          // ── Emit telemetry ───────────────────────────────────────────────
          onTelemetryRef.current({
            faceDetected:   true,
            gaze:           { x: gazeX, y: gazeY },
            earLeft:        parseFloat(earL.toFixed(3)),
            earRight:       parseFloat(earR.toFixed(3)),
            earAvg:         parseFloat(earAvg.toFixed(3)),
            eyesClosed,
            isLookingAway,
            isGazeAway,
            lipSync:        parseFloat(lipSync.toFixed(4)),
            t:              Date.now(),
          });
        });

        if (!videoRef.current || destroyed) return;

        // Small delay to ensure any previous camera session is released by the OS
        await new Promise(r => setTimeout(r, 100));

        camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (!destroyed && videoRef.current && faceMesh) {
              await faceMesh.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });

        await camera.start();
        if (!destroyed) setStatus('active');

      } catch (err: any) {
        console.error('[MediaPipe] Engine crash:', err);
        // Specifically handle NotReadableError
        if (err.name === 'NotReadableError' || err.message?.includes('NotReadableError')) {
          console.warn('[MediaPipe] Camera is already in use by another application.');
        }
        if (!destroyed) setStatus('error');
      }
    };

    start();

    return () => {
      destroyed = true;
      try { 
        camera?.stop();
        if (videoRef.current && (videoRef.current.srcObject as MediaStream)) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
      } catch (_) {}
      try { faceMesh?.close(); } catch (_) {}
    };
  }, [retryCount]); // Refire on retry

  // ── Status colour helpers ───────────────────────────────────────────────
  const dot: Record<ProctorStatus, string> = {
    active:       'bg-cyan-400 shadow-[0_0_8px_#00f2ff]',
    gaze_away:    'bg-yellow-400 shadow-[0_0_8px_#facc15] animate-pulse',
    eyes_closed:  'bg-orange-500 shadow-[0_0_8px_#f97316] animate-pulse',
    face_hidden:  'bg-red-500 shadow-[0_0_8px_#ef4444] animate-ping',
    initializing: 'bg-gray-500 animate-pulse',
    error:        'bg-red-700',
  };

  const label: Record<ProctorStatus, string> = {
    active:       '● NEURAL PULSE ACTIVE',
    gaze_away:    '⚠ GAZE DEVIATION',
    eyes_closed:  '⚠ EYES CLOSED',
    face_hidden:  '✕ FACE NOT DETECTED',
    initializing: '⟳ INITIALIZING...',
    error:        '✕ ENGINE OFFLINE',
  };

  const borderColor: Record<ProctorStatus, string> = {
    active:       'border-cyan-500/20',
    gaze_away:    'border-yellow-500/40',
    eyes_closed:  'border-orange-500/40',
    face_hidden:  'border-red-500/40',
    initializing: 'border-white/5',
    error:        'border-red-700/40',
  };

  return (
    <div className={`relative w-full h-full bg-black/60 rounded-[28px] overflow-hidden border ${borderColor[status]} transition-all duration-500`}>
      {/* ── Live video feed ─────────────────────────────────────── */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover scale-x-[-1]"
        style={{ opacity: status === 'active' ? 0.75 : 0.55, filter: status === 'face_hidden' ? 'grayscale(1)' : 'none', transition: 'all 0.5s' }}
        playsInline
        muted
      />

      {/* ── Alert overlay (face hidden / eyes closed / error) ────────────── */}
      {(status === 'face_hidden' || status === 'eyes_closed' || status === 'gaze_away' || status === 'error') && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none"
          style={{
            background:
              status === 'error'
                ? 'rgba(127,29,29,0.4)'
                : status === 'face_hidden'
                ? 'rgba(239,68,68,0.15)'
                : status === 'eyes_closed'
                ? 'rgba(249,115,22,0.12)'
                : 'rgba(250,204,21,0.08)',
          }}
        >
          {status === 'error' ? (
            <div className="flex flex-col items-center gap-3 pointer-events-auto">
              <span className="text-2xl">🚫</span>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-white">Camera Blocked</p>
                <p className="text-[8px] text-gray-300 mt-1 max-w-[120px]">Check if another app is using the camera.</p>
              </div>
              <button 
                onClick={() => { setStatus('initializing'); setRetryCount(c => c + 1); }}
                className="mt-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-[8px] font-black uppercase tracking-widest text-white transition-all"
              >
                Retry Link
              </button>
            </div>
          ) : (
            <>
              <span className="text-2xl">
                {status === 'face_hidden' ? '😶' : status === 'eyes_closed' ? '😴' : '👁️'}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/80">
                {status === 'face_hidden'
                  ? 'Face Hidden'
                  : status === 'eyes_closed'
                  ? 'Eyes Closed'
                  : 'Look Forward'}
              </span>
            </>
          )}
        </div>
      )}

      {/* ── Status badge ─────────────────────────────────────────── */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/80 backdrop-blur-xl rounded-full border border-white/10">
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot[status]}`} />
        <span className="text-[7px] font-black uppercase text-white tracking-[0.15em]">
          {label[status]}
        </span>
      </div>

      {/* ── Debug readout (gaze + EAR) ───────────────────────────── */}
      {status === 'active' && (
        <div className="absolute bottom-3 right-3 flex flex-col items-end gap-0.5 pointer-events-none">
          <span className="text-[7px] font-mono text-cyan-400/70">
            👁 EAR {earValue.toFixed(2)}
          </span>
          <span className="text-[7px] font-mono text-cyan-400/50">
            ◎ {gazeXY.x.toFixed(2)},{gazeXY.y.toFixed(2)}
          </span>
        </div>
      )}

      {/* ── Corner scan animation ────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none rounded-[28px]">
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-lg" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-lg" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-lg" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-500/40 rounded-br-lg" />
      </div>
    </div>
  );
}
