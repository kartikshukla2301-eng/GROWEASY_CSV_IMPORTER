import { create } from "zustand";
import { ImportStep, ParsedFile, ImportProgress, ImportResponse } from "../types";

interface ImportState {
  step: ImportStep;
  parsedFile: ParsedFile | null;
  progress: ImportProgress | null;
  result: ImportResponse | null;
  error: string | null;

  setParsedFile: (file: ParsedFile) => void;
  setProgress: (progress: ImportProgress) => void;
  setResult: (result: ImportResponse) => void;
  setError: (error: string | null) => void;
  goToStep: (step: ImportStep) => void;
  reset: () => void;
}

const initialState = {
  step: "upload" as ImportStep,
  parsedFile: null,
  progress: null,
  result: null,
  error: null,
};

export const useImportStore = create<ImportState>((set) => ({
  ...initialState,

  setParsedFile: (parsedFile) =>
    set({ parsedFile, step: "preview", error: null }),

  setProgress: (progress) => set({ progress }),

  setResult: (result) =>
    set({ result, step: "result", progress: null }),

  setError: (error) => set({ error }),

  goToStep: (step) => set({ step }),

  reset: () => set(initialState),
}));
