import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sun,
  Moon,
  Monitor,
  Plus,
  NotebookPen,
  ChevronDown,
  Loader2,
} from "lucide-react";
import NoteCard from "./components/NoteCard";
import NoteModal from "./components/NoteModal";
import SearchBar from "./components/SearchBar";
import { noteService } from "./services/api";
import type { Note, CreateNoteDto, UpdateNoteDto } from "./types/note";

type Theme = "light" | "dark" | "system";

export default function App() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || "system",
  );
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Theme Management
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      if (theme === "dark" || (theme === "system" && mediaQuery.matches)) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme();
    localStorage.setItem("theme", theme);

    const handleChange = () => {
      if (theme === "system") applyTheme();
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // React Query - تمیزکاری عبارت سرچ با .trim()
  const cleanSearchQuery = searchQuery.trim();

  const {
    data: notes = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["notes", cleanSearchQuery],
    queryFn: () => noteService.getNotes(cleanSearchQuery),
  });

  const createMutation = useMutation({
    mutationFn: noteService.createNote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
      await refetch();
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteDto }) =>
      noteService.updateNote(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
      await refetch();
      setIsModalOpen(false);
      setEditingNote(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: noteService.deleteNote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
      await refetch();
    },
  });

  // Handlers
  const handleSaveNote = (data: CreateNoteDto) => {
    if (editingNote) {
      updateMutation.mutate({ id: editingNote.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("آیا از حذف این یادداشت اطمینان دارید؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenEdit = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const getCurrentThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-5 h-5 text-amber-500" />;
      case "dark":
        return <Moon className="w-5 h-5 text-indigo-400" />;
      case "system":
        return <Monitor className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400">
            <NotebookPen className="w-6 h-6" />
            <span>thinkBoard</span>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              {getCurrentThemeIcon()}
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isThemeMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isThemeMenuOpen && (
              <div className="absolute left-0 mt-2 w-44 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg p-1.5 z-50 flex flex-col gap-1">
                <button
                  onClick={() => {
                    setTheme("light");
                    setIsThemeMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>تم روشن</span>
                </button>
                <button
                  onClick={() => {
                    setTheme("dark");
                    setIsThemeMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>تم تاریک</span>
                </button>
                <button
                  onClick={() => {
                    setTheme("system");
                    setIsThemeMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <Monitor className="w-4 h-4 text-indigo-500" />
                  <span>پیروی از سیستم</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">یادداشت‌های من</h1>
          <button
            onClick={() => {
              setEditingNote(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors shadow-sm cursor-pointer font-medium text-sm"
          >
            <Plus className="w-5 h-5" />
            <span>یادداشت جدید</span>
          </button>
        </div>

        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>در حال دریافت یادداشت‌ها...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900">
            خطا در برقراری ارتباط با سرور. لطفا اتصال اینترنت را بررسی کنید.
          </div>
        ) : notes.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
            هیچ یادداشتی یافت نشد!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        )}
      </main>

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNote(null);
        }}
        onSubmit={handleSaveNote}
        initialData={editingNote}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
