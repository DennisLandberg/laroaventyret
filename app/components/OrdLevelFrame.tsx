"use client";

import React from "react";

const STARTING_HEARTS = 3;

interface OrdLevelFrameProps {
  title: string;
  progressLabel: string;
  hearts: number;
  stars: number;
  ladybugLine: string;
  onBack: () => void;
  children: React.ReactNode;
  feedback?: { type: "success" | "error"; message: string } | null;
}

function BookLadybug({ mood }: { mood: "idle" | "happy" }) {
  return (
    <div className={`ordmagi-ladybug ${mood === "happy" ? "is-happy" : ""}`}>
      <div className="relative mx-auto h-[200px] w-[168px]">
        <div
          className="absolute left-[28px] top-[8px] h-[46px] w-[112px]"
          style={{
            background: "#f3e4c4",
            boxShadow: "inset 0 0 0 4px #6b4326, 0 5px 0 #24140c",
          }}
        />
        <div className="absolute left-[82px] top-[8px] h-[46px] w-[5px] bg-[#6b4326]" />
        <div
          className="absolute left-[58px] top-[58px] h-[28px] w-[52px] bg-[#1a1210]"
          style={{ boxShadow: "inset 0 0 0 3px #3a2a22" }}
        />
        <div className="absolute left-[66px] top-[64px] h-[12px] w-[12px] bg-white" />
        <div className="absolute left-[90px] top-[64px] h-[12px] w-[12px] bg-white" />
        <div className="absolute left-[70px] top-[68px] h-[4px] w-[4px] bg-[#1a1210]" />
        <div className="absolute left-[94px] top-[68px] h-[4px] w-[4px] bg-[#1a1210]" />
        <div
          className="absolute left-[24px] top-[84px] h-[88px] w-[120px] bg-[#e23b32]"
          style={{ boxShadow: "inset 0 0 0 5px #7a1814, 0 6px 0 #24140c" }}
        />
        <div className="absolute left-[82px] top-[84px] h-[88px] w-[5px] bg-[#7a1814]" />
        <div className="absolute left-[42px] top-[104px] h-[18px] w-[18px] bg-[#1a1210]" />
        <div className="absolute left-[108px] top-[98px] h-[16px] w-[16px] bg-[#1a1210]" />
        <div className="absolute left-[70px] top-[132px] h-[16px] w-[16px] bg-[#1a1210]" />
        <div className="absolute left-[18px] top-[176px] h-[18px] w-[132px] bg-[#3d6b3a] shadow-[0_4px_0_#1a2814]" />
      </div>
    </div>
  );
}

function LibraryBackdrop() {
  return (
    <div className="ordmagi-room" aria-hidden>
      <div className="ordmagi-rug" />
      <div className="ordmagi-shelf is-left">
        <span style={{ background: "#c44a3a" }} />
        <span style={{ background: "#3d8a46" }} />
        <span style={{ background: "#355f9a" }} />
        <span style={{ background: "#d27a28" }} />
        <span style={{ background: "#5a3d8a" }} />
        <span style={{ background: "#3d8a46" }} />
      </div>
      <div className="ordmagi-shelf is-right">
        <span style={{ background: "#3d8a46" }} />
        <span style={{ background: "#c44a3a" }} />
        <span style={{ background: "#d27a28" }} />
        <span style={{ background: "#355f9a" }} />
        <span style={{ background: "#5a3d8a" }} />
        <span style={{ background: "#3d8a46" }} />
      </div>
    </div>
  );
}

function OrdHud({
  title,
  progressLabel,
  hearts,
  stars,
  onBack,
  showStats = true,
}: {
  title: string;
  progressLabel: string;
  hearts: number;
  stars: number;
  onBack?: () => void;
  showStats?: boolean;
}) {
  return (
    <header className="ordmagi-hud">
      {onBack ? (
        <button type="button" className="ordmagi-wood ordmagi-hud-back" onClick={onBack}>
          ← Tillbaka
        </button>
      ) : (
        <span className="ordmagi-wood ordmagi-hud-back" style={{ visibility: "hidden" }}>
          ← Tillbaka
        </span>
      )}
      <div className="text-center">
        <h1 className="ordmagi-wood ordmagi-hud-title">{title}</h1>
        <p className="ordmagi-wood ordmagi-hud-sub">{progressLabel}</p>
      </div>
      {showStats ? (
        <div className="flex flex-col items-end gap-2">
          <div className="ordmagi-wood ordmagi-hud-stat" aria-label={`${hearts} hjärtan`}>
            {Array.from({ length: STARTING_HEARTS }, (_, index) => (
              <span
                key={index}
                className={index < hearts ? "ordmagi-hud-heart" : "ordmagi-hud-heart is-empty"}
              >
                ❤️
              </span>
            ))}
          </div>
          <div className="ordmagi-wood ordmagi-hud-stat">⭐ {stars}</div>
        </div>
      ) : (
        <span className="ordmagi-wood ordmagi-hud-stat" style={{ visibility: "hidden" }}>
          ⭐ 0
        </span>
      )}
    </header>
  );
}

export function OrdLevelFrame({
  title,
  progressLabel,
  hearts,
  stars,
  ladybugLine,
  onBack,
  children,
  feedback,
}: OrdLevelFrameProps) {
  return (
    <div className="ordmagi-scene">
      <LibraryBackdrop />
      <div className="ordmagi-stage">
        <OrdHud
          title={title}
          progressLabel={progressLabel}
          hearts={hearts}
          stars={stars}
          onBack={onBack}
        />
        <div className="ordmagi-body">
          <aside className="ordmagi-npc">
            <div className="ordmagi-bubble">{ladybugLine}</div>
            <BookLadybug mood={feedback?.type === "success" ? "happy" : "idle"} />
          </aside>
          <div className="ordmagi-board">
            <div className="ordmagi-parchment">
              {children}
              {feedback ? (
                <p
                  role="alert"
                  className={`ordmagi-feedback ${
                    feedback.type === "success" ? "is-success" : "is-error"
                  }`}
                >
                  {feedback.message}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrdFailScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="ordmagi-scene">
      <LibraryBackdrop />
      <div className="ordmagi-stage">
        <OrdHud
          title="Ordlandet"
          progressLabel="Försök igen"
          hearts={0}
          stars={0}
          showStats={false}
        />
        <div className="ordmagi-body">
          <aside className="ordmagi-npc">
            <div className="ordmagi-bubble">Vi tar det en gång till!</div>
            <BookLadybug mood="idle" />
          </aside>
          <div className="ordmagi-board">
            <div className="ordmagi-parchment">
              <div className="ordmagi-status-icon">❤️</div>
              <h2 className="ordmagi-status-title">Åh nej! Hjärtana tog slut ❤️</h2>
              <p className="ordmagi-status-copy">Försök igen!</p>
              <button type="button" className="ordmagi-svara" onClick={onRetry}>
                Försök igen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrdCompleteScreen({
  title,
  message,
  stars,
  onBack,
}: {
  title: string;
  message: string;
  stars: number;
  onBack: () => void;
}) {
  return (
    <div className="ordmagi-scene">
      <LibraryBackdrop />
      <div className="ordmagi-stage">
        <OrdHud title="Ordlandet" progressLabel="Klarad nivå!" hearts={3} stars={stars} />
        <div className="ordmagi-body">
          <aside className="ordmagi-npc">
            <div className="ordmagi-bubble">Bravo! Orden dansar av glädje!</div>
            <BookLadybug mood="happy" />
          </aside>
          <div className="ordmagi-board">
            <div className="ordmagi-parchment">
              <div className="ordmagi-status-icon">📖</div>
              <h2 className="ordmagi-status-title">{title}</h2>
              <p className="ordmagi-status-copy">{message}</p>
              <p className="ordmagi-kicker">⭐ {stars} stjärnor totalt</p>
              <button type="button" className="ordmagi-svara" onClick={onBack}>
                Tillbaka till Ordhuset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrdLoadingScreen() {
  return (
    <div className="ordmagi-scene">
      <LibraryBackdrop />
      <div className="ordmagi-stage">
        <OrdHud
          title="Hitta ordet"
          progressLabel="Nyckelpigan trollar..."
          hearts={3}
          stars={0}
          showStats={false}
        />
        <div className="ordmagi-body">
          <aside className="ordmagi-npc">
            <div className="ordmagi-bubble">Vänta lite... jag bläddrar i magiboken!</div>
            <BookLadybug mood="idle" />
          </aside>
          <div className="ordmagi-board">
            <div className="ordmagi-parchment">
              <div className="ordmagi-status-icon">🐞</div>
              <h2 className="ordmagi-status-title">Nyckelpigan trollar fram nya ord... ✨</h2>
              <p className="ordmagi-status-copy">Snart är ordgåtorna klara!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
