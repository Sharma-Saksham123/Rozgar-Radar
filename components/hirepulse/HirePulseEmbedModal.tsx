"use client";

import { useState } from "react";
import { X, Check, Copy, Code2, Globe, FileCode, Terminal } from "lucide-react";

interface HirePulseEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HirePulseEmbedModal({ isOpen, onClose }: HirePulseEmbedModalProps) {
  const [activeTab, setActiveTab] = useState<"widget" | "iframe" | "react" | "api">("widget");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const backendUrl = typeof window !== "undefined" ? window.location.origin.replace(":3000", ":8000") : "http://localhost:8000";
  const frontendUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  const widgetSnippet = `<!-- 1. Place this container where you want the job board to appear -->
<div id="hirepulse-jobs-widget" 
     data-api="${backendUrl}/api/v1" 
     data-theme="dark" 
     data-limit="8">
</div>

<!-- 2. Include the universal embed script -->
<script src="${backendUrl}/static/widget.js" async></script>`;

  const iframeSnippet = `<!-- Responsive iFrame Embed -->
<iframe 
  src="${frontendUrl}/hirepulse/embed" 
  width="100%" 
  height="750px" 
  style="border: none; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" 
  title="Job Board" 
  loading="lazy">
</iframe>`;

  const reactSnippet = `import { useState, useEffect } from "react";

export function EmbeddedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("${backendUrl}/api/v1/jobs?page_size=6")
      .then(res => res.json())
      .then(data => {
        setJobs(data.items);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading verified jobs...</div>;

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {jobs.map(job => (
        <div key={job.id} style={{ border: '1px solid #1f2937', padding: '16px', borderRadius: '8px' }}>
          <h4>{job.title}</h4>
          <p>{job.company_name} • {job.location_display}</p>
          <a href={job.application_url} target="_blank" rel="noreferrer">
            Apply on {job.source_name} &rarr;
          </a>
        </div>
      ))}
    </div>
  );
}`;

  const apiSnippet = `# Fetch live jobs with keyword and remote filter
curl -X GET "${backendUrl}/api/v1/jobs?keyword=engineer&work_mode=remote&page=1&page_size=10" \\
     -H "Accept: application/json"`;

  const getActiveCode = () => {
    switch (activeTab) {
      case "widget": return widgetSnippet;
      case "iframe": return iframeSnippet;
      case "react": return reactSnippet;
      case "api": return apiSnippet;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-black/95 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Code2 className="w-5 h-5 text-white" />
              <h2 className="text-xl font-medium tracking-tight text-white">
                Integrate into Any Website
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">
              Easily embed live, verified job listings into WordPress, Webflow, Shopify, React, or static HTML.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="px-6 pt-4 border-b border-gray-800 flex items-center gap-2 overflow-x-auto">
          {[
            { id: "widget", label: "JS Widget (HTML / CMS)", icon: Globe },
            { id: "iframe", label: "Responsive iFrame", icon: FileCode },
            { id: "react", label: "React / Next.js", icon: Code2 },
            { id: "api", label: "REST API (cURL)", icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 text-xs font-medium px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "border-white text-white"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Code preview & Copy action */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {activeTab === "widget" && "HTML Snippet (Drop into your page)"}
              {activeTab === "iframe" && "iFrame HTML Tag"}
              {activeTab === "react" && "React Component Code"}
              {activeTab === "api" && "Terminal Command"}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white hover:bg-gray-200 text-black shadow-sm transition-all cursor-pointer active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-black" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 bg-gray-950 border border-gray-800 rounded-xl text-xs font-mono text-gray-300 overflow-x-auto max-h-64 select-all leading-relaxed">
            {getActiveCode()}
          </pre>

          <div className="mt-4 p-3 rounded-lg bg-gray-950/60 border border-gray-800 text-xs text-gray-400 leading-relaxed">
            💡 <strong>Cross-Origin Enabled:</strong> The backend API has full CORS support enabled (<code className="text-white">Access-Control-Allow-Origin: *</code>).
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-black/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
