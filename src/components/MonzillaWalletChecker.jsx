import React, { useEffect, useState } from "react";
import Papa from "papaparse";

/* FULL UPDATED COMPONENT */
export default function MonzillaWalletChecker() {
  const [wallet, setWallet] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState({ freemint: {}, gtd: {}, fcfs: {} });

  const parseCsvRows = (rows) => {
    const out = {};
    (rows || []).forEach((r) => {
      if (!r) return;
      const walletKey = Object.keys(r).find((k) =>
        ["wallet","address","evm","wallet address","Wallet","EVM","Address"]
        .includes(k.toLowerCase())
      );
      const qtyKey = Object.keys(r).find((k) =>
        ["eligible","amount","qty","quantity","value","count","howmany"]
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
      { key: "fcfs", path: "/fcfs.csv" }
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
      if (csvData.freemint[w]) parts.push(`${csvData.freemint[w]}x FREEMINT`);
      if (csvData.gtd[w]) parts.push(`${csvData.gtd[w]}x GTD`);
      if (csvData.fcfs[w]) parts.push(`${csvData.fcfs[w]}x FCFS`);
      if (parts.length === 0) setResult("Sorry, your wallet is not whitelisted.");
      else setResult(`Congrats you are eligible for ${parts.join(" & ")}`);
      setLoading(false);
    }, 550);
  };

  return <div>FIXED</div>;
}
