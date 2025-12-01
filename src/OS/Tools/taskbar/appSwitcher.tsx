import React, { useEffect, useRef, useState } from "react";

type AppItem = {
  id: string;
  title: string;
};

const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

const AppSwitcher: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(0);
  const observerRef = useRef<MutationObserver | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const readWindowsFromDOM = () => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".window"));
    const items: AppItem[] = nodes.map(n => {
      const titleEl = n.querySelector<HTMLElement>(".draggable-window span");
      const title = titleEl?.textContent?.trim() || n.id || "Unnamed"; return { id: n.id, title };
    }).filter(i => i.id);
  }

  const setBlockedOnWindows = (blocked: boolean) => { 
    document.querySelectorAll<HTMLElement>(".window").forEach(w => { 
      if (blocked) w.classList.add("blocked"); 
      else w.classList.remove("blocked"); 
    }); 
  };

  useEffect(() => {
    readWindowsFromDOM();
    const mo = new MutationObserver(() => readWindowsFromDOM());
    observerRef.current = mo;
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    setBlockedOnWindows(isOpen);
    if (isOpen) {
      setTimeout(() => listRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Wyświetl wybrane okno i zamknij switcher
  const displayToggledApp = async (id: string) => {
    const win = document.getElementById(id);
    if (!win) {
      console.warn(`AppSwitcher: element with id ${id} not found`);
      return;
    }

    // Deaktywuj inne okna i aktywuj wybrane
    document.querySelectorAll<HTMLElement>(".window").forEach(w => w.classList.remove("active"));
    win.classList.add("active");

    // Przywróć widoczność i usuń blokadę
    onClose();
    setBlockedOnWindows(false);
    await delay(80);

    // Przenieś fokus do okna
    (win as HTMLElement).focus?.();

    const runBtn = document.getElementById("run-app-switcher");
    if (runBtn) {
      // opcjonalne: ustaw focus na przycisku po zamknięciu
      runBtn.focus();
    }
  };

  const openSwitcher = () => {
    readWindowsFromDOM();
    setIsOpen(true);
    setBlockedOnWindows(true);
    setTimeout(() => {
      // focus na listę, aby obsłużyć klawiaturę
      listRef.current?.focus();
    }, 0);
  };

  const closeSwitcher = () => {
    setIsOpen(false);
    setBlockedOnWindows(false);
  };

  // Obsługa klawiatury (Esc, ArrowUp/Down, Enter)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeSwitcher();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex(i => Math.min(i + 1, apps.length - 1));
      scrollHighlightedIntoView();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex(i => Math.max(i - 1, 0));
      scrollHighlightedIntoView();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = apps[highlightIndex];
      if (item) displayToggledApp(item.id);
    }
  };

  const scrollHighlightedIntoView = () => {
    const container = listRef.current;
    if (!container) return;
    const highlighted = container.querySelector<HTMLElement>(".app.highlight");
    highlighted?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  // Nasłuchuj zmian w DOM (dodanie/usunięcie okien)
  useEffect(() => {
    readWindowsFromDOM();

    const mo = new MutationObserver(() => {
      readWindowsFromDOM();
    });
    observerRef.current = mo;
    mo.observe(document.body, { childList: true, subtree: true, attributes: false });

    return () => {
      mo.disconnect();
      observerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gdy switcher się zamyka, upewnij się, że blocked jest usunięty
  useEffect(() => {
    if (!isOpen) setBlockedOnWindows(false);
  }, [isOpen]);

  return (
    <>
      {!isOpen && (
        <button
          id="run-app-switcher"
          className="app-switcher-icon"
          aria-label="Open App Switcher"
          onClick={openSwitcher}
        >
          🔲
        </button>
      )}

      {isOpen && (
        <div
          className="app-switcher-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => e.target === e.currentTarget && closeSwitcher()}
        >
          <div
            className="app-switcher"
            role="menu"
            aria-label="App Switcher"
            tabIndex={-1}
            onKeyDown={onKeyDown}
            ref={listRef}
          >
            <h3>Select app to switch</h3>

            {apps.length === 0 ? (
              <div className="app no-apps">No open apps</div>
            ) : (
              apps.map((a, idx) => {
                const isHighlighted = idx === highlightIndex;
                return (
                  <div
                    key={a.id}
                    role="menuitem"
                    tabIndex={0}
                    className={`app${isHighlighted ? " highlight" : ""}`}
                    onClick={() => displayToggledApp(a.id)}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    onKeyDown={(e) => e.key === "Enter" && displayToggledApp(a.id)}
                    aria-current={isHighlighted}
                  >
                    <div className="title">{a.title}</div>
                    <div className="meta">{a.id}</div>
                  </div>
                );
              })
            )}

            <div className="switcher-actions">
              <button
                className="close-switcher"
                onClick={closeSwitcher}
                aria-label="Close App Switcher"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppSwitcher;
