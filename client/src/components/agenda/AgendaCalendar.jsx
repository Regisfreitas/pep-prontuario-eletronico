import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/agenda.css';

const locales = { 'pt-BR': ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const VIEW_MAP = { month: 'month', week: 'week', day: 'day' };

function EventComponent({ event }) {
  const synced = Boolean(event.resource?.google_event_id);
  return (
    <span className="flex items-center gap-1 truncate">
      {synced && (
        <span className="text-[9px] font-bold bg-white/25 px-1 rounded shrink-0" title="Google Agenda">
          G
        </span>
      )}
      <span className="truncate">{event.title}</span>
    </span>
  );
}

function eventStyleGetter(event) {
  const isBloqueio = event.resource?.tipo_evento === 'BLOQUEIO';
  return {
    className: isBloqueio ? 'rbc-event-bloqueio' : 'rbc-event-consulta',
  };
}

function dayHeaderFormat(date) {
  const dayName = format(date, 'EEEE', { locale: ptBR }).toUpperCase();
  const dayNum = format(date, 'd/M', { locale: ptBR });
  return `${dayName} ${dayNum}`;
}

export default function AgendaCalendar({ events, view, currentDate, onNavigate, onViewChange }) {
  return (
    <div className="agenda-calendar flex-1 px-6 py-4 min-h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        view={VIEW_MAP[view]}
        date={currentDate}
        onNavigate={onNavigate}
        onView={() => {}}
        toolbar={false}
        step={30}
        timeslots={1}
        min={new Date(1970, 0, 1, 7, 0)}
        max={new Date(1970, 0, 1, 20, 0)}
        culture="pt-BR"
        formats={{
          dayHeaderFormat,
          dayRangeHeaderFormat: ({ start, end }) =>
            `${format(start, 'd', { locale: ptBR })} – ${format(end, "d 'de' MMM", { locale: ptBR })}`,
        }}
        components={{ event: EventComponent }}
        eventPropGetter={eventStyleGetter}
        style={{ height: '100%', minHeight: 560 }}
      />
    </div>
  );
}
