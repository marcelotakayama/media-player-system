import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchMedias, getPlaylistItems } from "../services/playerService";
import "./player.css";

type JoinedItem = {
  id: string;
  nome: string;
  descricao?: string;
  urlArquivo: string;
  tipo: string; 
  ordem: number;
};

function usePlaylistId(): string {
  const sp = new URLSearchParams(location.search);
  const qs = sp.get("id") || "";
  const pathId = location.pathname.replace(/^\//, "");
  return qs || pathId;
}

const IMAGE_DURATION_MS = 5000;

const IconPrev = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h2v14H6zM20 6v12L9 12l11-6z"/></svg>
);
const IconPlay = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);
const IconPause = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
);
const IconNext = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M16 5h2v14h-2zM4 6v12l11-6L4 6z"/></svg>
);
const IconRefresh = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35A7.95 7.95 0 0 0 12 4V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 13.65-6.65Z"/></svg>
);
const IconVolume = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg>
);

export default function PlayerPage() {
  const playlistId = usePlaylistId();
  const [items, setItems] = useState<JoinedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [idx, setIdx] = useState(0);

  const [volume, setVolume] = useState(1);

  const imgTickRef = useRef<number | null>(null);
  const imgStartTsRef = useRef<number>(0);
  const imgAccumulatedRef = useRef<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [progress, setProgress] = useState(0);
  const [remaining, setRemaining] = useState<number>(0);
  const [currentSeconds, setCurrentSeconds] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);

  const current = items[idx];

  const load = useCallback(async () => {
    if (!playlistId) return;
    setLoading(true);
    try {
      const [medias, list] = await Promise.all([fetchMedias(), getPlaylistItems(playlistId)]);
      const byId = new Map(medias.map(m => [m.id, m] as const));
      const joined = list
        .map(li => {
          const m = byId.get(li.mediaId);
          return m ? { ...m, ordem: li.ordem } : null;
        })
        .filter(Boolean)
        .sort((a: any, b: any) => a.ordem - b.ordem) as JoinedItem[];
      setItems(joined);
      setIdx(0);
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    return () => {
      if (imgTickRef.current) {
        window.clearInterval(imgTickRef.current);
        imgTickRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setProgress(0);
    setRemaining(0);
    setCurrentSeconds(0);
    imgAccumulatedRef.current = 0;
    if (imgTickRef.current) {
      window.clearInterval(imgTickRef.current);
      imgTickRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [idx]);

  useEffect(() => {
    if (!current) return;

    if (imgTickRef.current) {
      window.clearInterval(imgTickRef.current);
      imgTickRef.current = null;
    }

    if (!playing) {
      if (current.tipo.startsWith("video") && videoRef.current) videoRef.current.pause();
      if (current.tipo.startsWith("audio") && audioRef.current) audioRef.current.pause();
      return;
    }

    if (current.tipo.startsWith("image")) {
      setTotalSeconds(Math.ceil(IMAGE_DURATION_MS / 1000));

      imgStartTsRef.current = performance.now();
      imgTickRef.current = window.setInterval(() => {
        const elapsed = imgAccumulatedRef.current + (performance.now() - imgStartTsRef.current);
        const ratio = Math.min(1, elapsed / IMAGE_DURATION_MS);
        setProgress(ratio);
        setCurrentSeconds(Math.floor(elapsed / 1000));
        const remMs = Math.max(0, IMAGE_DURATION_MS - elapsed);
        setRemaining(Math.ceil(remMs / 1000));

        if (elapsed >= IMAGE_DURATION_MS) {
          imgAccumulatedRef.current = 0;
          if (imgTickRef.current) {
            window.clearInterval(imgTickRef.current);
            imgTickRef.current = null;
          }
          setIdx(i => (i + 1) % (items.length || 1));
        }
      }, 100) as unknown as number;
    } else if (current.tipo.startsWith("video")) {
      const v = videoRef.current;
      if (!v) return;

      v.volume = volume;

      const tryPlay = () => v.play().catch(() => {});
      if (v.readyState >= 2) tryPlay();
      else v.onloadeddata = tryPlay;

      const onTime = () => {
        const dur = v.duration || 0;
        const cur = v.currentTime || 0;
        const ratio = dur > 0 ? Math.min(1, cur / dur) : 0;
        setProgress(ratio);
        setCurrentSeconds(Math.floor(cur));
        setTotalSeconds(Math.ceil(dur));
        const rem = dur > 0 ? Math.max(0, Math.ceil(dur - cur)) : 0;
        setRemaining(rem);
      };
      v.addEventListener("timeupdate", onTime);
      onTime();

      return () => v.removeEventListener("timeupdate", onTime);
    } else if (current.tipo.startsWith("audio")) {
      const a = audioRef.current;
      if (!a) return;

      a.volume = volume;

      const tryPlay = () => a.play().catch(() => {});
      if (a.readyState >= 2) tryPlay();
      else a.onloadeddata = tryPlay;

      const onTime = () => {
        const dur = a.duration || 0;
        const cur = a.currentTime || 0;
        const ratio = dur > 0 ? Math.min(1, cur / dur) : 0;
        setProgress(ratio);
        setCurrentSeconds(Math.floor(cur));
        setTotalSeconds(Math.ceil(dur));
        const rem = dur > 0 ? Math.max(0, Math.ceil(dur - cur)) : 0;
        setRemaining(rem);
      };
      a.addEventListener("timeupdate", onTime);
      onTime();

      return () => a.removeEventListener("timeupdate", onTime);
    }
  }, [current, items.length, playing, volume]);

  useEffect(() => {
    if (!current || !current.tipo.startsWith("image")) return;
    if (playing) {
      imgStartTsRef.current = performance.now();
      if (!imgTickRef.current) {
        imgTickRef.current = window.setInterval(() => {
          const elapsed = imgAccumulatedRef.current + (performance.now() - imgStartTsRef.current);
          const ratio = Math.min(1, elapsed / IMAGE_DURATION_MS);
          setProgress(ratio);
          setCurrentSeconds(Math.floor(elapsed / 1000));
          const remMs = Math.max(0, IMAGE_DURATION_MS - elapsed);
          setRemaining(Math.ceil(remMs / 1000));
          if (elapsed >= IMAGE_DURATION_MS) {
            imgAccumulatedRef.current = 0;
            if (imgTickRef.current) {
              window.clearInterval(imgTickRef.current);
              imgTickRef.current = null;
            }
            setIdx(i => (i + 1) % (items.length || 1));
          }
        }, 100) as unknown as number;
      }
    } else {
      if (imgTickRef.current) {
        window.clearInterval(imgTickRef.current);
        imgTickRef.current = null;
      }
      const elapsedNow = performance.now() - imgStartTsRef.current;
      imgAccumulatedRef.current = Math.min(IMAGE_DURATION_MS, imgAccumulatedRef.current + elapsedNow);
    }
  }, [playing, current, items.length]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = volume === 0;
    }
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = volume === 0;
    }
  }, [volume]);

  const onPrev = () => setIdx(i => (i - 1 + items.length) % (items.length || 1));
  const onNext = () => setIdx(i => (i + 1) % (items.length || 1));
  const onToggle = () => {
    setPlaying(p => {
      const n = !p;
      if (videoRef.current) n ? videoRef.current.play().catch(() => {}) : videoRef.current.pause();
      if (audioRef.current) n ? audioRef.current.play().catch(() => {}) : audioRef.current.pause();
      return n;
    });
  };

  const onSeek = (pct: number) => {
    const ratio = Math.max(0, Math.min(1, pct / 100));
    setProgress(ratio);
    if (!current) return;

    if (current.tipo.startsWith("image")) {
      const newElapsed = ratio * IMAGE_DURATION_MS;
      imgAccumulatedRef.current = newElapsed;
      setCurrentSeconds(Math.floor(newElapsed / 1000));
      setRemaining(Math.ceil((IMAGE_DURATION_MS - newElapsed) / 1000));
      if (ratio >= 1) {
        if (imgTickRef.current) {
          window.clearInterval(imgTickRef.current);
          imgTickRef.current = null;
        }
        imgAccumulatedRef.current = 0;
        setIdx(i => (i + 1) % (items.length || 1));
        return;
      }
      if (playing) {
        if (imgTickRef.current) {
          window.clearInterval(imgTickRef.current);
          imgTickRef.current = null;
        }
        imgStartTsRef.current = performance.now();
        imgTickRef.current = window.setInterval(() => {
          const elapsed = imgAccumulatedRef.current + (performance.now() - imgStartTsRef.current);
          const r = Math.min(1, elapsed / IMAGE_DURATION_MS);
          setProgress(r);
          setCurrentSeconds(Math.floor(elapsed / 1000));
          const remMs = Math.max(0, IMAGE_DURATION_MS - elapsed);
          setRemaining(Math.ceil(remMs / 1000));
          if (elapsed >= IMAGE_DURATION_MS) {
            imgAccumulatedRef.current = 0;
            if (imgTickRef.current) {
              window.clearInterval(imgTickRef.current);
              imgTickRef.current = null;
            }
            setIdx(i => (i + 1) % (items.length || 1));
          }
        }, 100) as unknown as number;
      }
    } else if (current.tipo.startsWith("video")) {
      const v = videoRef.current;
      if (!v || !isFinite(v.duration) || v.duration <= 0) return;
      v.currentTime = ratio * v.duration;
    } else if (current.tipo.startsWith("audio")) {
      const a = audioRef.current;
      if (!a || !isFinite(a.duration) || a.duration <= 0) return;
      a.currentTime = ratio * a.duration;
    }
  };

  const pct = Math.round(progress * 100);
  const ProgressBar = useMemo(() => {
    return (
      <div style={{ marginTop: 8 }}>
        <input
          className="range"
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={(e) => onSeek(Number(e.target.value))}
        />
        <div className="timebar">
          <span>Tempo: {currentSeconds}s</span>
          <span>Restante: {remaining}s</span>
          <span>Total: {totalSeconds || (current?.tipo.startsWith("image") ? Math.ceil(IMAGE_DURATION_MS / 1000) : 0)}s</span>
        </div>
      </div>
    );
  }, [pct, currentSeconds, remaining, totalSeconds]);

  const VolumeControl =
    current && (current.tipo.startsWith("video") || current.tipo.startsWith("audio")) ? (
      <div className="controls" style={{ gap: 6 }}>
        <IconVolume />
        <input
          className="range"
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => setVolume(Number(e.target.value) / 100)}
          style={{ width: 180 }}
        />
        <span style={{ fontSize: 12, width: 34, textAlign: "right", opacity: .75 }}>
          {Math.round(volume * 100)}%
        </span>
      </div>
    ) : null;

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto", color: "#111", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <div className="player-header">
        <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <span role="img" aria-label="clapper">🎬</span> Player Preview
        </h3>
        <button className="btn btn--ghost" onClick={() => load()} disabled={loading} title="Atualizar playlist">
          <IconRefresh /> {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      <div className="player-box">
        {!current ? (
          <div style={{ padding: 24, textAlign: "center" }}>Sem itens na playlist</div>
        ) : current.tipo.startsWith("image") ? (
          <div style={{ width: "100%", textAlign: "center" }}>
            <img
              src={current.urlArquivo}
              alt={current.nome}
              style={{ maxWidth: "100%", maxHeight: "65vh", objectFit: "contain", borderRadius: 8 }}
            />
            {ProgressBar}
          </div>
        ) : current.tipo.startsWith("video") ? (
          <div>
            <video
              ref={videoRef}
              src={current.urlArquivo}
              style={{ width: "100%", maxHeight: "65vh", borderRadius: 8 }}
              controls={false}
              onEnded={onNext}
            />
            {ProgressBar}
          </div>
        ) : current.tipo.startsWith("audio") ? (
          <div>
            <div style={{ marginBottom: 8, opacity: .85 }}>{current.nome}</div>
            <audio
              ref={audioRef}
              src={current.urlArquivo}
              style={{ width: "100%" }}
              controls={false}
              onEnded={onNext}
            />
            {ProgressBar}
          </div>
        ) : (
          <div style={{ padding: 24 }}>Tipo não suportado: {current.tipo}</div>
        )}
      </div>

      <div className="controls controls--center controls--gap-top">
        <button className="btn btn--icon" onClick={onPrev} disabled={!items.length} title="Anterior (←)">
          <IconPrev />
        </button>

        <button
          className="btn btn--primary"
          onClick={onToggle}
          disabled={!items.length}
          title="Reproduzir/Pausar (Espaço)"
        >
          {playing ? <><IconPause /> Pausar</> : <><IconPlay /> Reproduzir</>}
        </button>

        <button className="btn btn--icon" onClick={onNext} disabled={!items.length} title="Próximo (→)">
          <IconNext />
        </button>

        {VolumeControl}
      </div>

      <div style={{ marginTop: 8, opacity: 0.7, textAlign: "center" }}>
        {items.length > 0 ? `#${idx + 1}/${items.length} – ${current?.nome}` : "Nenhum item carregado"}
      </div>
    </div>
  );
}
