import React, { useState, useEffect } from "react";

const CATEGORIES = [
  { id: "space", label: "🚀 우주", prompt: "우주와 관련된" },
  { id: "science", label: "⚗️ 과학", prompt: "일상 속 신기한 과학" },
  { id: "nature", label: "🌊 자연", prompt: "자연현상과 관련된" },
  { id: "tech", label: "💻 기술", prompt: "미래 기술과 관련된" },
  { id: "food", label: "🍜 음식", prompt: "음식과 요리에 관련된" },
  { id: "random", label: "🎲 랜덤", prompt: "완전히 엉뚱하고 신박한" },
];

const STEPS = ["주제", "스크립트", "나레이션", "완성"];

export default function App() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiInput, setShowApiInput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stars, setStars] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setStars(Array.from({ length: 70 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 2 + 0.5, delay: Math.random() * 5, dur: Math.random() * 3 + 2,
    })));
    const saved = localStorage.getItem("gemini_key");
    if (saved) setApiKey(saved);
  }, []);

  const callGemini = async (prompt) => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  };

  const generateTopics = async () => {
    if (!apiKey) { setShowApiInput(true); return; }
    if (!category) return;
    setLoading(true); setTopics([]); setSelectedTopic(""); setError("");
    try {
      const cat = CATEGORIES.find(c => c.id === category);
      const text = await callGemini(`${cat.prompt} 신박하고 흥미로운 유튜브 쇼츠 주제 5개. "우주에서 라면을 끓이면?" 같은 의문형. 줄바꿈으로 구분, 번호없이, 한국어만.`);
      setTopics(text.split("\n").map(t => t.trim()).filter(t => t.length > 5).slice(0, 5));
    } catch (e) { setError("API 오류: " + e.message); }
    setLoading(false);
  };

  const generateScript = async () => {
    const topic = selectedTopic || customTopic;
    if (!apiKey) { setShowApiInput(true); return; }
    if (!topic) return;
    setLoading(true); setScript(""); setError("");
    try {
      const text = await callGemini(`유튜브 쇼츠 스크립트. 주제: "${topic}". 45~55초(약 220자), 강렬한 첫 후킹, 핵심정보 2~3가지, "구독하면 더 신박한 거 알려줄게요!"로 마무리. 나레이션 텍스트만, 한국어.`);
      setScript(text);
    } catch (e) { setError("API 오류: " + e.message); }
    setLoading(false);
  };

  const topic = selectedTopic || customTopic;
  return (
    <div style={{ minHeight: "100vh", background: "#03020a", color: "#fff", fontFamily: "'Segoe UI', sans-serif", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.15} 50%{opacity:.9} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 20px; margin-bottom: 14px; animation: fadeUp .4s ease; }
        .btn-primary { background: linear-gradient(135deg,#059669,#0284c7); color:#fff; border:none; border-radius:14px; padding:14px 20px; font-size:14px; font-weight:700; cursor:pointer; width:100%; transition:.2s; }
        .btn-primary:hover { opacity:.85; }
        .btn-primary:disabled { opacity:.4; cursor:not-allowed; }
        .btn-ghost { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:12px 20px; font-size:13px; cursor:pointer; width:100%; transition:.2s; }
        .topic-item { padding:13px 15px; border-radius:12px; border:1.5px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.03); color:rgba(255,255,255,0.7); font-size:13px; cursor:pointer; margin-bottom:8px; line-height:1.6; transition:.2s; }
        .topic-item.active { border-color:#10b981; background:rgba(16,185,129,0.12); color:#d1fae5; font-weight:600; }
        .cat-btn { padding:14px 8px; border-radius:14px; border:1.5px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.03); color:rgba(255,255,255,0.6); font-size:12px; cursor:pointer; text-align:center; transition:.2s; width:100%; }
        .cat-btn.active { border-color:#10b981; background:rgba(16,185,129,0.15); color:#10b981; font-weight:700; }
        input,textarea { background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1); border-radius:12px; padding:12px 14px; color:#fff; font-size:13px; outline:none; box-sizing:border-box; width:100%; font-family:inherit; }
        ::placeholder { color:rgba(255,255,255,0.25); }
      `}</style>

      {stars.map(s => (
        <div key={s.id} style={{ position:"fixed", left:`${s.x}%`, top:`${s.y}%`, width:s.size, height:s.size, borderRadius:"50%", background:"#fff", animation:`twinkle ${s.dur}s ${s.delay}s infinite`, pointerEvents:"none", zIndex:0 }} />
      ))}

      <div style={{ position:"relative", zIndex:1, maxWidth:480, margin:"0 auto", padding:"0 16px 140px" }}>
        <div style={{ textAlign:"center", padding:"48px 0 28px" }}>
          <div style={{ fontSize:36, marginBottom:8 }}>🪐</div>
          <div style={{ fontSize:26, fontWeight:800, background:"linear-gradient(135deg,#34d399,#38bdf8,#a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:6 }}>Shorts Studio</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", letterSpacing:3, textTransform:"uppercase" }}>AI 유튜브 쇼츠 자동화</div>
          <div style={{ marginTop:8, display:"inline-block", padding:"4px 12px", borderRadius:20, background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)", fontSize:11, color:"#34d399" }}>✅ Gemini 무료</div>
        </div>

        <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:4, marginBottom:32 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color: i < step ? "#34d399" : i === step ? "#38bdf8" : "rgba(255,255,255,0.25)", fontWeight: i === step ? 700 : 400 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background: i < step ? "#34d399" : i === step ? "#38bdf8" : "rgba(255,255,255,0.2)" }} />
                {s}
              </div>
              {i < STEPS.length - 1 && <div style={{ width:14, height:1, background:"rgba(255,255,255,0.1)" }} />}
            </div>
          ))}
        </div>

        {error && <div style={{ padding:"12px 16px", borderRadius:12, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", color:"#fca5a5", fontSize:13, marginBottom:14 }}>⚠️ {error}</div>}

        {step === 0 && (
          <>
            <div className="card">
              <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:1, textTransform:"uppercase", marginBottom:14 }}>카테고리 선택</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
                {CATEGORIES.map(c => (
                  <button key={c.id} className={`cat-btn${category === c.id ? " active" : ""}`} onClick={() => setCategory(c.id)}>
                    <div style={{ fontSize:22, marginBottom:4 }}>{c.label.split(" ")[0]}</div>
                    <div>{c.label.split(" ")[1]}</div>
                  </button>
                ))}
              </div>
              <button className="btn-primary" onClick={generateTopics} disabled={loading || !category}>
                {loading ? "✨ 생성 중..." : "✨ 주제 5개 뽑아줘!"}
              </button>
            </div>
            {topics.length > 0 && (
              <div className="card">
                <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:1, textTransform:"uppercase", marginBottom:14 }}>추천 주제 (클릭해서 선택)</div>
                {topics.map((t, i) => (
                  <div key={i} className={`topic-item${selectedTopic === t ? " active" : ""}`} onClick={() => { setSelectedTopic(t); setCustomTopic(""); }}>{t}</div>
                ))}
              </div>
            )}
            <div className="card">
              <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>직접 입력</div>
              <textarea rows={3} placeholder="예) 블랙홀 안에 들어가면 시간이 멈출까?" value={customTopic} onChange={e => { setCustomTopic(e.target.value); setSelectedTopic(""); }} style={{ resize:"none" }} />
            </div>
            {topic && <button className="btn-primary" onClick={() => setStep(1)}>📝 스크립트 만들기 →</button>}
          </>
        )}

        {step === 1 && (
          <>
            <div className="card">
              <div style={{ fontSize:11, color:"rgba(52,211,153,0.8)", fontWeight:700, letterSpacing:1, marginBottom:8, textTransform:"uppercase" }}>선택한 주제</div>
              <div style={{ fontSize:15, fontWeight:700, color:"#d1fae5", lineHeight:1.6, marginBottom:16 }}>{topic}</div>
              <button className="btn-primary" onClick={generateScript} disabled={loading}>{loading ? "✍️ 작성 중..." : "✍️ 스크립트 자동 생성"}</button>
            </div>
            {script && (
              <div className="card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:1, textTransform:"uppercase" }}>생성된 스크립트</div>
                  <button onClick={() => { navigator.clipboard.writeText(script); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ background:"none", border:"none", color:"#38bdf8", fontSize:12, cursor:"pointer" }}>{copied ? "✅ 복사됨" : "📋 복사"}</button>
                </div>
                <div style={{ background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:16, fontSize:14, lineHeight:1.9, color:"rgba(255,255,255,0.85)", whiteSpace:"pre-wrap" }}>{script}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", marginTop:8 }}>약 {Math.ceil(script.replace(/\s/g,'').length / 4.5)}초 분량</div>
              </div>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:4 }}>
              {script && <button className="btn-primary" onClick={() => setStep(2)}>🎙️ 나레이션 준비 →</button>}
              <button className="btn-ghost" onClick={() => setStep(0)}>← 주제 다시 선택</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="card">
              <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:1, textTransform:"uppercase", marginBottom:14 }}>나레이션 방법</div>
              <div style={{ padding:"14px", borderRadius:12, background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)", marginBottom:10 }}>
                <div style={{ fontWeight:700, color:"#34d399", marginBottom:6, fontSize:13 }}>✅ Edge TTS (완전 무료)</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.7 }}>Microsoft 무료 TTS · 한국어 자연스러움</div>
                <div style={{ marginTop:10, padding:"10px 12px", background:"rgba(0,0,0,0.4)", borderRadius:8, fontFamily:"monospace", fontSize:11, color:"#a7f3d0", lineHeight:1.8 }}>pip install edge-tts<br/>edge-tts --voice ko-KR-SunHiNeural \<br/>--text "스크립트" --write-media out.mp3</div>
              </div>
              <div style={{ padding:"14px", borderRadius:12, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontWeight:700, color:"rgba(255,255,255,0.5)", marginBottom:4, fontSize:13 }}>🎤 직접 녹음 (수익창출 유리)</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", lineHeight:1.7 }}>본인 목소리 = 알고리즘 ↑ · 30~60초면 완성</div>
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>스크립트 복사</div>
              <div style={{ background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:14, fontSize:13, lineHeight:1.8, color:"rgba(255,255,255,0.8)", whiteSpace:"pre-wrap", marginBottom:12 }}>{script}</div>
              <button className="btn-ghost" onClick={() => { navigator.clipboard.writeText(script); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? "✅ 복사 완료!" : "📋 스크립트 전체 복사"}</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <button className="btn-primary" onClick={() => setStep(3)}>🎬 영상 편집 가이드 →</button>
              <button className="btn-ghost" onClick={() => setStep(1)}>← 스크립트로 돌아가기</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="card" style={{ textAlign:"center", padding:"28px 20px" }}>
              <div style={{ fontSize:52 }}>🎉</div>
              <div style={{ fontSize:20, fontWeight:800, marginTop:10 }}>거의 다 됐어요!</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:6 }}>마지막 편집만 하면 업로드 완성!</div>
            </div>
            {[
              { e:"1️⃣", t:"CapCut 열기", d:"새 프로젝트 → 9:16 세로 비율 설정" },
              { e:"2️⃣", t:"배경 영상", d:"pexels.com에서 무료 영상 검색 후 다운로드" },
              { e:"3️⃣", t:"음성 삽입", d:"Edge TTS mp3 또는 직접 녹음 파일 추가" },
              { e:"4️⃣", t:"자막 자동 생성", d:"CapCut → 자막 → 자동 자막 (무료)" },
              { e:"5️⃣", t:"업로드 🚀", d:"제목에 키워드 + 해시태그 3~5개 달기" },
            ].map((item, i) => (
              <div key={i} className="card" style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ fontSize:24, minWidth:36 }}>{item.e}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{item.t}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", lineHeight:1.6 }}>{item.d}</div>
                </div>
              </div>
            ))}
            <button className="btn-primary" onClick={() => { setStep(0); setTopics([]); setSelectedTopic(""); setCustomTopic(""); setScript(""); setCategory(null); }}>🪐 새 쇼츠 만들기</button>
          </>
        )}
      </div>

      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, padding:"12px 16px 28px", background:"rgba(3,2,10,0.96)", borderTop:"1px solid rgba(255,255,255,0.07)", zIndex:100, backdropFilter:"blur(20px)" }}>
        {showApiInput ? (
          <div style={{ display:"flex", gap:8 }}>
            <input type="password" placeholder="Gemini API 키 (AIza...)" value={apiKey} onChange={e => setApiKey(e.target.value)} />
            <button className="btn-primary" style={{ width:"auto", padding:"12px 18px" }} onClick={() => { localStorage.setItem("gemini_key", apiKey); setShowApiInput(false); }}>저장</button>
          </div>
        ) : (
          <button className="btn-ghost" style={{ border: apiKey ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.1)", color: apiKey ? "#34d399" : "rgba(255,255,255,0.7)" }} onClick={() => setShowApiInput(true)}>
            {apiKey ? "🔑 Gemini API 키 설정됨 ✅" : "🔑 Gemini API 키 입력하기"}
          </button>
        )}
      </div>
    </div>
  );
}
