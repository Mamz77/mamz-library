"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  X,
  BookOpen,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface PDFReaderProps {
  bookId: string;
  bookTitle: string;
  pdfUrl: string;
  totalPages: number;
  initialPage: number;
  userId: string;
  bookSlug: string;
}

export function PDFReader({
  bookId,
  bookTitle,
  pdfUrl,
  totalPages,
  initialPage,
  userId,
  bookSlug,
}: PDFReaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<unknown>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const sessionStartRef = useRef<Date>(new Date());
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [numPages, setNumPages] = useState(totalPages || 0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageInput, setPageInput] = useState(String(initialPage));

  const supabase = createClient();

  // Save progress to Supabase
  const saveProgress = useCallback(
    async (page: number, pages: number) => {
      if (!userId || !bookId) return;
      const percentage = pages > 0 ? Math.min((page / pages) * 100, 100) : 0;
      await supabase.from("reading_progress").upsert(
        {
          user_id: userId,
          book_id: bookId,
          current_page: page,
          percentage,
          last_read_at: new Date().toISOString(),
        },
        { onConflict: "user_id,book_id" }
      );
    },
    [userId, bookId, supabase]
  );

  // Debounced auto-save
  const scheduleSave = useCallback(
    (page: number, pages: number) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => saveProgress(page, pages), 1500);
    },
    [saveProgress]
  );

  // Save reading session on unmount
  useEffect(() => {
    return () => {
      const duration = Math.round(
        (new Date().getTime() - sessionStartRef.current.getTime()) / 1000
      );
      if (duration > 10) {
        supabase.from("reading_sessions").insert({
          user_id: userId,
          book_id: bookId,
          duration_seconds: duration,
          started_at: sessionStartRef.current.toISOString(),
          ended_at: new Date().toISOString(),
        });
      }
    };
  }, []);

  // Load PDF.js and render
  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setError(null);
      try {
        // Dynamically import pdfjs-dist
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const pdf = await pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
        }).promise;

        if (cancelled) return;
        pdfRef.current = pdf;
        const pages = pdf.numPages;
        setNumPages(pages);
        setLoading(false);
        renderPage(pdf, currentPage, scale);
      } catch (err) {
        if (!cancelled) {
          console.error("PDF load error:", err);
          setError("خطا در بارگذاری فایل PDF. لطفاً دوباره تلاش کنید.");
          setLoading(false);
        }
      }
    }

    loadPdf();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  async function renderPage(pdf: unknown, pageNum: number, pageScale: number) {
    if (!canvasRef.current || !pdf) return;

    // Cancel previous render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    try {
      const pdfDoc = pdf as {
        getPage: (n: number) => Promise<{
          getViewport: (o: { scale: number }) => { width: number; height: number };
          render: (o: {
            canvasContext: CanvasRenderingContext2D;
            viewport: unknown;
          }) => { promise: Promise<void>; cancel: () => void };
        }>;
      };
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: pageScale });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderTask = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = renderTask;
      await renderTask.promise;
      renderTaskRef.current = null;
    } catch (err: unknown) {
      // Ignore cancelled renders
      if (err instanceof Error && err.name !== "RenderingCancelledException") {
        console.error("Render error:", err);
      }
    }
  }

  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(page, numPages || 1));
      setCurrentPage(clamped);
      setPageInput(String(clamped));
      if (pdfRef.current) renderPage(pdfRef.current, clamped, scale);
      scheduleSave(clamped, numPages);
    },
    [numPages, scale, scheduleSave]
  );

  const changeScale = (delta: number) => {
    const next = Math.max(0.5, Math.min(3, scale + delta));
    setScale(next);
    if (pdfRef.current) renderPage(pdfRef.current, currentPage, next);
  };

  const resetScale = () => {
    setScale(1.2);
    if (pdfRef.current) renderPage(pdfRef.current, currentPage, 1.2);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const percentage =
    numPages > 0 ? Math.round((currentPage / numPages) * 100) : 0;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-zinc-950 flex flex-col"
      dir="rtl"
    >
      {/* Top bar */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center gap-3 shrink-0">
        <Link
          href={`/book/${bookSlug}`}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">بستن</span>
        </Link>

        <div className="h-4 w-px bg-zinc-700" />

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <BookOpen className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-sm text-white font-medium truncate">{bookTitle}</span>
        </div>

        {/* Progress */}
        <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400">
          <span>{percentage}٪</span>
          <div className="w-24 bg-zinc-700 rounded-full h-1.5">
            <div
              className="bg-purple-500 h-1.5 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-4 pdf-reader-container">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <p className="text-zinc-400 text-sm">در حال بارگذاری کتاب...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 max-w-sm text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
              <X className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-zinc-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className={cn(
            "shadow-2xl rounded-sm max-w-full",
            loading || error ? "hidden" : "block"
          )}
        />
      </div>

      {/* Bottom controls */}
      <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-3 flex items-center justify-between gap-3 shrink-0">
        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 text-sm">
            <input
              type="number"
              value={pageInput}
              min={1}
              max={numPages}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => goToPage(parseInt(pageInput) || currentPage)}
              onKeyDown={(e) => {
                if (e.key === "Enter") goToPage(parseInt(pageInput) || currentPage);
              }}
              className="w-14 bg-zinc-800 border border-zinc-700 rounded-lg text-center text-white text-sm py-1 focus:outline-none focus:border-purple-500"
              dir="ltr"
            />
            <span className="text-zinc-500">از</span>
            <span className="text-zinc-300">{numPages.toLocaleString("fa-IR")}</span>
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= numPages}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => changeScale(-0.2)}
            title="کوچک‌تر"
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetScale}
            title="اندازه اصلی"
            className="px-2 py-1 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors min-w-[3rem] text-center"
          >
            {Math.round(scale * 100)}٪
          </button>
          <button
            onClick={() => changeScale(0.2)}
            title="بزرگ‌تر"
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            title="تمام صفحه"
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors hidden sm:flex"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
