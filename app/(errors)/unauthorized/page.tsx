// app/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&display=swap');

        .unauth-root {
          min-height: 100vh;
          background: #0a0608;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Rajdhani', sans-serif;
          padding: 2rem;
        }

        .unauth-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(192,57,43,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(192,57,43,0.05) 1px, transparent 1px);
          background-size: 44px 44px;
        }

        .unauth-corner {
          position: absolute;
          width: 20px; height: 20px;
          border-color: #c0392b;
          border-style: solid;
        }

        @media (min-width: 640px) {
          .unauth-corner { width: 24px; height: 24px; }
        }

        .unauth-corner.tl { top: 16px; left: 16px; border-width: 2px 0 0 2px; }
        .unauth-corner.tr { top: 16px; right: 16px; border-width: 2px 2px 0 0; }
        .unauth-corner.bl { bottom: 16px; left: 16px; border-width: 0 0 2px 2px; }
        .unauth-corner.br { bottom: 16px; right: 16px; border-width: 0 2px 2px 0; }

        @media (min-width: 640px) {
          .unauth-corner.tl { top: 32px; left: 32px; }
          .unauth-corner.tr { top: 32px; right: 32px; }
          .unauth-corner.bl { bottom: 32px; left: 32px; }
          .unauth-corner.br { bottom: 32px; right: 32px; }
        }

        .unauth-shield {
          position: relative;
          width: 64px; height: 64px;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 640px) {
          .unauth-shield { width: 80px; height: 80px; }
        }

        .unauth-diamond {
          width: 52px; height: 52px;
          background: rgba(192,57,43,0.12);
          border: 1.5px solid rgba(192,57,43,0.5);
          transform: rotate(45deg);
          position: absolute;
          top: 6px; left: 6px;
        }

        @media (min-width: 640px) {
          .unauth-diamond { width: 64px; height: 64px; top: 8px; left: 8px; }
        }

        .unauth-shield-icon {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
        }

        .unauth-alert-label {
          font-family: monospace;
          font-size: 10px;
          letter-spacing: 0.3em;
          color: rgba(192,57,43,0.7);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        @media (min-width: 640px) {
          .unauth-alert-label { font-size: 11px; }
        }

        .unauth-title {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #e74c3c;
          margin-bottom: 0.25rem;
          text-align: center;
        }

        @media (min-width: 640px) {
          .unauth-title { font-size: 2rem; }
        }

        .unauth-code {
          font-family: monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          color: rgba(231,76,60,0.6);
          margin-bottom: 1.5rem;
        }

        .unauth-desc {
          font-size: 1rem;
          color: rgba(255,255,255,0.4);
          text-align: center;
          max-width: 320px;
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 640px) {
          .unauth-desc { font-size: 1.05rem; max-width: 380px; }
        }

        .unauth-tags {
          display: flex;
          gap: 8px;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .unauth-tag {
          font-family: monospace;
          font-size: 9px;
          letter-spacing: 0.15em;
          color: rgba(192,57,43,0.6);
          border: 1px solid rgba(192,57,43,0.2);
          padding: 4px 8px;
          text-transform: uppercase;
        }

        @media (min-width: 640px) {
          .unauth-tag { font-size: 10px; padding: 4px 10px; }
        }

        .unauth-btns {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .unauth-btn-primary {
          padding: 10px 20px;
          background: #c0392b;
          color: #fff;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          border: none;
          cursor: pointer;
        }

        @media (min-width: 640px) {
          .unauth-btn-primary { padding: 10px 24px; font-size: 0.9rem; }
        }

        .unauth-btn-secondary {
          padding: 10px 20px;
          background: transparent;
          color: rgba(192,57,43,0.7);
          font-family: 'Rajdhani', sans-serif;
          font-weight: 600;
          font-size: 0.85rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid rgba(192,57,43,0.3);
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
        }

        @media (min-width: 640px) {
          .unauth-btn-secondary { padding: 10px 24px; font-size: 0.9rem; }
        }

        .unauth-bottom {
          position: absolute;
          bottom: 16px; left: 16px; right: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px;
        }

        @media (min-width: 640px) {
          .unauth-bottom { bottom: 20px; left: 32px; right: 32px; }
        }

        .unauth-bottom-info {
          font-family: monospace;
          font-size: 9px;
          color: rgba(255,255,255,0.15);
          letter-spacing: 0.1em;
        }

        @media (min-width: 640px) {
          .unauth-bottom-info { font-size: 10px; }
        }

        .unauth-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: monospace;
          font-size: 9px;
          color: #e74c3c;
          letter-spacing: 0.1em;
        }

        @media (min-width: 640px) {
          .unauth-status { font-size: 10px; }
        }

        .unauth-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #e74c3c;
          animation: unauth-blink 1.2s infinite;
        }

        @keyframes unauth-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>

      <main className="unauth-root">
        <div className="unauth-grid" />

        <div className="unauth-corner tl" />
        <div className="unauth-corner tr" />
        <div className="unauth-corner bl" />
        <div className="unauth-corner br" />

        {/* Shield */}
        <div className="unauth-shield">
          <div className="unauth-diamond" />
          <div className="unauth-shield-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="1.5">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <circle cx="12" cy="15" r="0.8" fill="#e74c3c"/>
            </svg>
          </div>
        </div>

        <p className="unauth-alert-label">Security Alert</p>
        <h1 className="unauth-title">Access Denied</h1>
        <p className="unauth-code">// ERR_403_RESTRICTED</p>
        <p className="unauth-desc">
          You do not have the required clearance to enter this zone. Return to your designated area.
        </p>

        <div className="unauth-tags">
          <span className="unauth-tag">error_code: 403</span>
          <span className="unauth-tag">zone: restricted</span>
        </div>

        {/*<div className="unauth-btns">
          <a href="javascript:history.back()" className="unauth-btn-primary">
            ← Return to Base
          </a>
          <a href="/signin" className="unauth-btn-secondary">
            Go to Login →
          </a>
        </div>*/}

        
      </main>
    </>
  );
}