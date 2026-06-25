import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  format,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  fetchAgenda,
  createConsulta,
  createBloqueio,
  eventToCalendar,
  formatDateISO,
} from '../api/agenda';

const CLINIC_ID = 1;

export function useAgenda() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 17));
  const [view, setView] = useState('week');
  const [doctorFilter, setDoctorFilter] = useState(null);
  const [events, setEvents] = useState([]);
  const [medicos, setMedicos] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const range = useMemo(() => {
    if (view === 'month') {
      return {
        start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 }),
        end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 }),
      };
    }
    if (view === 'day') {
      return { start: startOfDay(currentDate), end: endOfDay(currentDate) };
    }
    return {
      start: startOfWeek(currentDate, { weekStartsOn: 0 }),
      end: endOfWeek(currentDate, { weekStartsOn: 0 }),
    };
  }, [currentDate, view]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAgenda({
        startDate: formatDateISO(range.start),
        endDate: formatDateISO(range.end),
        clinicId: CLINIC_ID,
        doctorId: doctorFilter,
      });
      setEvents(data.events.map(eventToCalendar));
      setMedicos(data.medicos ?? {});
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [range.start, range.end, doctorFilter]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return events;
    const term = searchTerm.toLowerCase();
    return events.filter((e) =>
      e.title.toLowerCase().includes(term) ||
      e.resource?.paciente_nome?.toLowerCase().includes(term)
    );
  }, [events, searchTerm]);

  const navigate = useCallback((direction) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === 'month') d.setMonth(d.getMonth() + direction);
      else if (view === 'day') d.setDate(d.getDate() + direction);
      else d.setDate(d.getDate() + direction * 7);
      return d;
    });
  }, [view]);

  const goToday = useCallback(() => setCurrentDate(new Date()), []);

  const dateLabel = useMemo(() => {
    if (view === 'month') return format(currentDate, 'MMMM yyyy', { locale: ptBR });
    if (view === 'day') return format(currentDate, "d 'de' MMM 'de' yyyy", { locale: ptBR });
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    return `${format(start, 'd', { locale: ptBR })} – ${format(end, "d 'de' MMM 'de' yyyy", { locale: ptBR })}`;
  }, [currentDate, view]);

  const scheduleConsulta = useCallback(async (payload) => {
    const result = await createConsulta({ ...payload, clinic_id: CLINIC_ID });
    await loadEvents();
    return result;
  }, [loadEvents]);

  const scheduleBloqueio = useCallback(async (payload) => {
    const result = await createBloqueio({ ...payload, clinic_id: CLINIC_ID });
    await loadEvents();
    return result;
  }, [loadEvents]);

  return {
    currentDate,
    setCurrentDate,
    view,
    setView,
    doctorFilter,
    setDoctorFilter,
    events: filteredEvents,
    medicos,
    loading,
    searchTerm,
    setSearchTerm,
    navigate,
    goToday,
    dateLabel,
    scheduleConsulta,
    scheduleBloqueio,
    reload: loadEvents,
  };
}
