import React, { useEffect, useState } from "react";
import Papa from "papaparse";

export default function MonzillaWalletChecker() {
  const [wallet, setWallet] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState({ freemint: {}, gtd: {}, fcfs: {} });

  // 🔧 FIXED CSV PARSER
  const parseCsvRows = (rows) => {
    const out = {};

    (rows || []).forEach((r) => {
      if (!r) return;

      // detect wallet column
      const walletKey = Object.keys(r).find((k) =>
        [
          "wallet",
          "address",
          "evm",
          "Wallet Address",
          "Wallet",
          "EVM",
          "Address",
        ]
          .map((x) => x.toLowerCase())
          .includes(k.toLowerCase())
      );

      // detect quantity column
      const qtyKey = Object.keys(r).find((k) =>
        [
          "eligible",
          "amount",
          "qty",
          "quantity",
          "value",
          "count",
          "Count",
          "HowMany",
        ]
          .map((x) => x.toLowerCase())
          .includes(k.toLowerCase())
      );

      const key = (r[walletKey] || "").toString().trim().toLowerCase();
      const qty = Number(r[qtyKey] || 0);

      if (key) out[key] = qty;
    });

    return out;
  };

  useEffect(() => {
    const files = [
      { key: "freemint", path: "/freemint.csv" },
      { key: "gtd", path: "/gtd.csv" },
      { key: "fcfs", path: "/fcfs.csv" },
    ];

    files.forEach(async ({ key, path }) => {
      try {
        const resp = await fetch(path);
        if (!resp.ok) return;
        const text = await resp.text();
        const parsed = Papa.parse(text, { header: true });
        setCsvData((prev) => ({ ...prev, [key]: parseCsvRows(parsed.data) }));
      } catch (e) {}
    });
  }, []);

  const normalize = (s) => (s || "").toString().trim().toLowerCase();

  const handleCheck = () => {
    const w = normalize(wallet);
    if (!w || !w.startsWith("0x")) {
      setResult("Please enter a valid wallet address starting with 0x...");
      return;
    }

    setLoading(true);
    setResult(null);

    setTimeout(() => {
      const parts = [];
      if (csvData.freemint[w])
        parts.push(`${csvData.freemint[w]}x FREEMINT`);
      if (csvData.gtd[w]) parts.push(`${csvData.gtd[w]}x GTD`);
      if (csvData.fcfs[w]) parts.push(`${csvData.fcfs[w]}x FCFS`);

      if (parts.length === 0) {
        setResult("Sorry, your wallet is not whitelisted.");
      } else {
        setResult(`Congrats you are eligible for ${parts.join(" & ")}`);
      }

      setLoading(false);
    }, 550);
  };

  const css = `
    .mon-container { font-family: Poppins, Arial, sans-serif; }
    .top-socials { position: fixed; top: 14px; right: 16px; display:flex; gap:12px; z-index:60 }
    .social-icon { width:36px; height:36px; cursor:pointer; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.12)); }
    .logo-zone { display:flex; justify-content:center; margin-bottom:16px; }
    .checker-card { max-width:1100px; margin: 0 auto; background:#f6f5f7; border-radius:18px; padding:30px 25px; border:8px solid #7a40d7; box-shadow:0 10px 0 rgba(0,0,0,0.06); position:relative }
    .checker-title{ text-align:center; font-size:36px; color:#2b0b5a; margin: 6px 0 18px; text-transform:uppercase }
    .input-wrap { position:relative; margin-top:20px; }
    .input-label { display:block; font-weight:700; color:#3b3b3b; margin-bottom:6px }
    .input-row { position:relative; }
    .wallet-input { width:100%; padding:16px 18px; border-radius:12px; border:3px solid #cdb9ff; font-size:18px; box-sizing:border-box }
    .zilla-head-inline { position:absolute; left:140px; top:-53px; width:120px; z-index:30; pointer-events:none; }
    .check-btn{ display:inline-block; min-width:300px; padding:14px 22px; border-radius:28px; background:linear-gradient(90deg,#7a40d7,#c95eb7); font-size:20px; font-weight:800; color:#fff; border:3px solid rgba(0,0,0,0.08); box-shadow:0 8px 0 rgba(0,0,0,0.09); cursor:pointer; transition:0.15s }
    .check-btn:hover{ transform:scale(1.04) }
    .check-btn:active{ transform:scale(0.98) }
    .result-msg{ margin-top:18px; text-align:center; min-height:48px }
    .result-pill{
  display:inline-block;
  background: linear-gradient(90deg,#7a40d7,#c95eb7);
  padding:10px 14px;
  border-radius:12px;
  font-weight:700;
  color:white;
  box-shadow:0 4px 10px rgba(0,0,0,0.25);
}
    .bottom-graphics{ position:relative; height:140px; margin-top:22px }
    .baby-left{ position:absolute; left:8px; bottom:0; width:160px }
    .baby-right{ position:absolute; right:8px; bottom:0; width:160px }
    @media (max-width:1024px){ .checker-card{ padding:26px; } .checker-title{ font-size:32px } }
    @media (max-width:720px){ .checker-card{ margin: 25px; padding:18px } .checker-title{ font-size:26px } .zilla-head-inline{ width:90px; left:185px !important; top:-34px } .check-btn{ min-width:240px; font-size:16px } .baby-left, .baby-right{ width:120px } } .checker-title{ font-size:26px } .zilla-head-inline{ width:90px; left:260px; top:-33px } top:-33px } .check-btn{ min-width:240px; font-size:16px } .baby-left, .baby-right{ width:150px } }
  `;

  return (
    <>
      <style>{`body { margin:0; padding:0; background:#000; } html, body, #root { height:100%; width:100%; overflow-x:hidden; }`}</style>
      <div
        className="mon-container"
        style={{
          width: "100%",
          overflowX: "hidden",
          minHeight: "100vh",
          backgroundImage: "url('/bg-monzilla.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          padding: "36px 18px 60px",
        }}
      >
        <style>{css}</style>

        <div className="top-socials">
          <a href="https://x.com/monzillanad" target="_blank" rel="noreferrer">
            <img src="/icon-x.png" alt="X" className="social-icon" />
          </a>
          <a
            href="https://discord.gg/monzillanad"
            target="_blank"
            rel="noreferrer"
          >
            <img src="/icon-discord.png" alt="Discord" className="social-icon" />
          </a>
        </div>

        <div className="logo-zone">
          <img
            src="/monzilla-text.png"
            alt="Monzilla"
            style={{ width: "60%", maxWidth: 520 }}
          />
        </div>

        <div className="checker-card">
          <h2 className="checker-title">WALLET STATUS CHECK</h2>

          <div className="input-wrap">
            <div className="input-row">
              <img
                src="/zilla-head.png"
                alt="zilla"
                className="zilla-head-inline"
              />
              <label className="input-label">ENTER WALLET ADDRESS:</label>
              <input
                className="wallet-input"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="0x..."
                aria-label="wallet-address"
              />
            </div>
          </div>

          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 26 }}
          >
            <button className="check-btn" onClick={handleCheck}>
              {loading ? "Checking..." : "CHECK NOW!"}
            </button>
          </div>

          <div className="result-msg">
            {result ? (
              <div className="result-pill">{result}</div>
            ) : (
              <div style={{ height: 24 }} />
            )}
          </div>

          <div className="bottom-graphics">
            <img src="/baby-zilla-left.png" alt="left" className="baby-left" />
            <img
              src="/baby-zilla-right.png"
              alt="right"
              className="baby-right"
            />
          </div>
        </div>
      </div>
    </>
  );
}
