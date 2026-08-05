import { SquarePen, Trash2 } from "lucide-react";
import type { Note } from "../types/note";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
      <div>
        <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-slate-100 line-clamp-1">
          {note.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm whitespace-pre-wrap line-clamp-4 leading-relaxed">
          {note.content}
        </p>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-400">
        <span>{formatDate(note.createdAt)}</span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
            title="ویرایش"
          >
            <SquarePen className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
