import axios from "axios";
import type { Note, CreateNoteDto, UpdateNoteDto } from "../types/note";

const API_BASE_URL = "https://thinkboard.codewithmmd.ir/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const normalizeNote = (rawNote: any): Note => ({
  id: rawNote?.id || rawNote?._id || String(Math.random()),
  title: rawNote?.title || "بدون عنوان",
  content: rawNote?.content || "",
  createdAt: rawNote?.createdAt || new Date().toISOString(),
  updatedAt: rawNote?.updatedAt || new Date().toISOString(),
});

export const noteService = {
  // دریافت لیست یادداشت‌ها با حذف اسپیس‌های اضافی سرچ
  getNotes: async (term: string = ""): Promise<Note[]> => {
    const cleanTerm = term.trim();
    const res = await api.get("/notes", { params: { term: cleanTerm } });
    const data = res.data;

    let rawList: any[] = [];
    if (Array.isArray(data)) {
      rawList = data;
    } else if (data?.response && Array.isArray(data.response)) {
      rawList = data.response;
    } else if (data?.response?.notes && Array.isArray(data.response.notes)) {
      rawList = data.response.notes;
    } else if (data?.notes && Array.isArray(data.notes)) {
      rawList = data.notes;
    }

    return rawList.map(normalizeNote);
  },

  getNoteById: async (id: string): Promise<Note> => {
    const res = await api.get(`/notes/${id}`);
    const item = res.data?.response || res.data;
    return normalizeNote(item);
  },

  // ایجاد یادداشت جدید با حذف اسپیس‌های ابتدا و انتها
  createNote: async (noteData: CreateNoteDto): Promise<Note> => {
    const payload = {
      title: noteData.title.trim(),
      content: noteData.content.trim(),
    };
    const res = await api.post("/notes", payload);
    const item = res.data?.response || res.data;
    return normalizeNote(item);
  },

  // ویرایش یادداشت
  updateNote: async (id: string, noteData: UpdateNoteDto): Promise<Note> => {
    const payload: Record<string, any> = {};
    if (noteData.title !== undefined) payload.title = noteData.title.trim();
    if (noteData.content !== undefined)
      payload.content = noteData.content.trim();

    const res = await api.put(`/notes/${id}`, payload);
    const item = res.data?.response || res.data;
    return normalizeNote(item);
  },

  deleteNote: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },
};
