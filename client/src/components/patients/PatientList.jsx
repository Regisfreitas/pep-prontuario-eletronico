export default function PatientList({ patients, onSelectPatient }) {
  if (patients.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm min-h-[240px] flex items-center justify-center">
        Nenhum paciente cadastrado. Clique em &quot;Cadastrar Novo Paciente&quot; para começar.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto min-h-[240px]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className="py-3 px-4 font-semibold text-slate-600">Nome</th>
            <th className="py-3 px-4 font-semibold text-slate-600 w-24">Idade</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr
              key={patient.id}
              data-testid={`patient-item-${patient.id}`}
              onClick={() => onSelectPatient(patient.id)}
              className="border-b border-slate-100 hover:bg-brand-50 cursor-pointer transition-colors"
            >
              <td className="py-3 px-4 text-slate-800 font-medium">{patient.full_name}</td>
              <td className="py-3 px-4 text-slate-600">{patient.age} anos</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
