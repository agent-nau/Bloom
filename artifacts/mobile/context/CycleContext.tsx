import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface Cycle {
  id: string;
  startDate: string;
  endDate?: string;
}

export interface DayLog {
  date: string;
  flow?: "spotting" | "light" | "medium" | "heavy";
  symptoms: string[];
  mood?: string;
}

export interface CycleSettings {
  cycleLength: number;
  periodLength: number;
}

export type Phase = "period" | "follicular" | "fertile" | "ovulation" | "luteal";

export interface DateStatus {
  isPeriod: boolean;
  isPredictedPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  isToday: boolean;
  hasLog: boolean;
}

interface CycleContextType {
  cycles: Cycle[];
  logs: DayLog[];
  settings: CycleSettings;
  loaded: boolean;
  todayStr: string;
  currentCycleDay: number;
  phase: Phase;
  phaseName: string;
  phaseDescription: string;
  nextPeriodDate: string | null;
  daysUntilNextPeriod: number | null;
  fertileStart: string | null;
  fertileEnd: string | null;
  ovulationDate: string | null;
  isInPeriod: boolean;
  isFertile: boolean;
  todayLog: DayLog | null;
  averageCycleLength: number;
  averagePeriodLength: number;
  lastCycle: Cycle | null;
  startPeriod: () => Promise<void>;
  startPeriodOnDate: (dateStr: string) => Promise<void>;
  updatePeriodStartDate: (oldStartDate: string, newStartDate: string) => Promise<void>;
  endPeriod: () => Promise<void>;
  saveDayLog: (log: Partial<DayLog> & { date?: string }) => Promise<void>;
  updateSettings: (s: Partial<CycleSettings>) => Promise<void>;
  clearAllData: () => Promise<void>;
  getDateStatus: (dateStr: string) => DateStatus;
}

function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(dateStr: string, n: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + n);
  return formatDate(d);
}

export function diffDays(a: string, b: string): number {
  const da = parseLocalDate(a);
  const db = parseLocalDate(b);
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

function getTodayStr(): string {
  return formatDate(new Date());
}

const defaultSettings: CycleSettings = { cycleLength: 28, periodLength: 5 };

const CycleContext = createContext<CycleContextType | undefined>(undefined);

export function CycleProvider({ children }: { children: React.ReactNode }) {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [settings, setSettings] = useState<CycleSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  const todayStr = getTodayStr();

  useEffect(() => {
    const load = async () => {
      try {
        const [cStr, lStr, sStr] = await Promise.all([
          AsyncStorage.getItem("cycles"),
          AsyncStorage.getItem("logs"),
          AsyncStorage.getItem("settings"),
        ]);
        if (cStr) setCycles(JSON.parse(cStr));
        if (lStr) setLogs(JSON.parse(lStr));
        if (sStr) setSettings(JSON.parse(sStr));
      } catch (_) {
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem("cycles", JSON.stringify(cycles));
  }, [cycles, loaded]);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem("logs", JSON.stringify(logs));
  }, [logs, loaded]);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem("settings", JSON.stringify(settings));
  }, [settings, loaded]);

  const sortedCycles = useMemo(
    () => [...cycles].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [cycles]
  );

  const lastCycle = sortedCycles[sortedCycles.length - 1] ?? null;

  const averageCycleLength = useMemo(() => {
    if (sortedCycles.length < 2) return settings.cycleLength;
    const lengths: number[] = [];
    for (let i = 1; i < sortedCycles.length; i++) {
      lengths.push(diffDays(sortedCycles[i - 1].startDate, sortedCycles[i].startDate));
    }
    return Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
  }, [sortedCycles, settings.cycleLength]);

  const averagePeriodLength = useMemo(() => {
    const withEnd = sortedCycles.filter((c) => c.endDate);
    if (withEnd.length === 0) return settings.periodLength;
    const lengths = withEnd.map((c) => diffDays(c.startDate, c.endDate!) + 1);
    return Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
  }, [sortedCycles, settings.periodLength]);

  const currentCycleDay = useMemo(() => {
    if (!lastCycle) return 0;
    return Math.max(1, diffDays(lastCycle.startDate, todayStr) + 1);
  }, [lastCycle, todayStr]);

  const isInPeriod = useMemo(() => {
    if (!lastCycle) return false;
    const endDate = lastCycle.endDate ?? addDays(lastCycle.startDate, averagePeriodLength - 1);
    return todayStr >= lastCycle.startDate && todayStr <= endDate;
  }, [lastCycle, todayStr, averagePeriodLength]);

  const fertileStart = useMemo(
    () => (lastCycle ? addDays(lastCycle.startDate, averageCycleLength - 19) : null),
    [lastCycle, averageCycleLength]
  );

  const fertileEnd = useMemo(
    () => (lastCycle ? addDays(lastCycle.startDate, averageCycleLength - 13) : null),
    [lastCycle, averageCycleLength]
  );

  const ovulationDate = useMemo(
    () => (lastCycle ? addDays(lastCycle.startDate, averageCycleLength - 14) : null),
    [lastCycle, averageCycleLength]
  );

  const isFertile = useMemo(() => {
    if (!fertileStart || !fertileEnd) return false;
    return todayStr >= fertileStart && todayStr <= fertileEnd;
  }, [todayStr, fertileStart, fertileEnd]);

  const nextPeriodDate = useMemo(
    () => (lastCycle ? addDays(lastCycle.startDate, averageCycleLength) : null),
    [lastCycle, averageCycleLength]
  );

  const daysUntilNextPeriod = useMemo(() => {
    if (!nextPeriodDate) return null;
    return diffDays(todayStr, nextPeriodDate);
  }, [nextPeriodDate, todayStr]);

  const phase = useMemo((): Phase => {
    if (!lastCycle) return "follicular";
    if (isInPeriod) return "period";
    if (todayStr === ovulationDate) return "ovulation";
    if (isFertile) return "fertile";
    if (currentCycleDay > averageCycleLength - 13) return "luteal";
    return "follicular";
  }, [isInPeriod, isFertile, todayStr, ovulationDate, currentCycleDay, averageCycleLength, lastCycle]);

  const phaseName = useMemo((): string => {
    switch (phase) {
      case "period": return "Period";
      case "ovulation": return "Ovulation";
      case "fertile": return "Fertile Window";
      case "luteal": return "Luteal Phase";
      case "follicular": return "Follicular Phase";
    }
  }, [phase]);

  const phaseDescription = useMemo((): string => {
    switch (phase) {
      case "period": return "Your period is here. Rest and take care of yourself.";
      case "ovulation": return "Peak fertility. Ovulation is happening today.";
      case "fertile": return "High chance of conception. Fertile window is open.";
      case "luteal": return "Post-ovulation phase. Your body is preparing.";
      case "follicular": return "Your body is gearing up for the next ovulation.";
    }
  }, [phase]);

  const todayLog = useMemo(
    () => logs.find((l) => l.date === todayStr) ?? null,
    [logs, todayStr]
  );

  const getDateStatus = useCallback(
    (dateStr: string): DateStatus => {
      const isToday = dateStr === todayStr;
      const hasLog = logs.some((l) => l.date === dateStr);

      let isPeriod = false;
      for (const cycle of sortedCycles) {
        const end = cycle.endDate ?? addDays(cycle.startDate, averagePeriodLength - 1);
        if (dateStr >= cycle.startDate && dateStr <= end) {
          isPeriod = true;
          break;
        }
      }

      let isPredictedPeriod = false;
      if (nextPeriodDate) {
        const predictedEnd = addDays(nextPeriodDate, averagePeriodLength - 1);
        if (dateStr >= nextPeriodDate && dateStr <= predictedEnd && !isPeriod) {
          isPredictedPeriod = true;
        }
      }

      let isFertileDay = false;
      let isOvulation = false;
      if (fertileStart && fertileEnd && ovulationDate) {
        if (dateStr >= fertileStart && dateStr <= fertileEnd) isFertileDay = true;
        if (dateStr === ovulationDate) isOvulation = true;
      }

      return { isPeriod, isPredictedPeriod, isFertile: isFertileDay, isOvulation, isToday, hasLog };
    },
    [sortedCycles, logs, todayStr, nextPeriodDate, averagePeriodLength, fertileStart, fertileEnd, ovulationDate]
  );

  const startPeriod = useCallback(async () => {
    const alreadyStarted = sortedCycles.some((c) => c.startDate === todayStr);
    if (alreadyStarted) return;
    const newCycle: Cycle = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
      startDate: todayStr,
    };
    setCycles((prev) => [...prev, newCycle]);
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === todayStr);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], flow: updated[idx].flow ?? "medium" };
        return updated;
      }
      return [...prev, { date: todayStr, symptoms: [], flow: "medium" }];
    });
  }, [sortedCycles, todayStr]);

  const startPeriodOnDate = useCallback(async (dateStr: string) => {
    const alreadyStarted = sortedCycles.some((c) => c.startDate === dateStr);
    if (alreadyStarted) return;
    const newCycle: Cycle = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
      startDate: dateStr,
    };
    setCycles((prev) => [...prev, newCycle]);
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === dateStr);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], flow: updated[idx].flow ?? "medium" };
        return updated;
      }
      return [...prev, { date: dateStr, symptoms: [], flow: "medium" }];
    });
  }, [sortedCycles]);

  const endPeriod = useCallback(async () => {
    if (!lastCycle) return;
    setCycles((prev) => {
      const updated = [...prev];
      const idx = updated.length - 1;
      updated[idx] = { ...updated[idx], endDate: todayStr };
      return updated;
    });
  }, [lastCycle, todayStr]);

  const saveDayLog = useCallback(async (log: Partial<DayLog> & { date?: string }) => {
    const date = log.date ?? todayStr;
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === date);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...log, date };
        return updated;
      }
      return [...prev, { symptoms: [], ...log, date } as DayLog];
    });
  }, [todayStr]);

  const updateSettings = useCallback(async (s: Partial<CycleSettings>) => {
    setSettings((prev) => ({ ...prev, ...s }));
  }, []);

  const updatePeriodStartDate = useCallback(async (oldStartDate: string, newStartDate: string) => {
    setCycles((prev) => {
      const updated = [...prev];
      const cycleIndex = updated.findIndex((c) => c.startDate === oldStartDate);
      if (cycleIndex >= 0) {
        updated[cycleIndex] = { ...updated[cycleIndex], startDate: newStartDate };
      }
      return updated;
    });
    
    // Update any logs associated with the old date
    setLogs((prev) => {
      const updated = [...prev];
      const logIndex = updated.findIndex((l) => l.date === oldStartDate);
      if (logIndex >= 0) {
        updated[logIndex] = { ...updated[logIndex], date: newStartDate };
      }
      return updated;
    });
  }, []);

  const clearAllData = useCallback(async () => {
    // Clear all cycle data
    setCycles([]);
    setLogs([]);
    setSettings(defaultSettings);
    
    // Clear AsyncStorage
    await AsyncStorage.removeItem("cycles");
    await AsyncStorage.removeItem("logs");
    await AsyncStorage.removeItem("settings");
  }, []);

  const value: CycleContextType = {
    cycles,
    logs,
    settings,
    loaded,
    todayStr,
    currentCycleDay,
    phase,
    phaseName,
    phaseDescription,
    nextPeriodDate,
    daysUntilNextPeriod,
    fertileStart,
    fertileEnd,
    ovulationDate,
    isInPeriod,
    isFertile,
    todayLog,
    averageCycleLength,
    averagePeriodLength,
    lastCycle,
    startPeriod,
    startPeriodOnDate,
    updatePeriodStartDate,
    endPeriod,
    saveDayLog,
    updateSettings,
    clearAllData,
    getDateStatus,
  };

  return (
    <CycleContext.Provider value={value}>
      {children}
    </CycleContext.Provider>
  );
}

export function useCycle() {
  const ctx = useContext(CycleContext);
  if (!ctx) throw new Error("useCycle must be used within CycleProvider");
  return ctx;
}
