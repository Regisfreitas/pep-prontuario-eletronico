export const TABS = [
  {
    id: 'anamnese',
    label: 'Anamnese, Subjetivo e Objetivo',
    shortLabel: 'Anamnese',
  },
  {
    id: 'orientacao',
    label: 'Orientação Médica',
    shortLabel: 'Orientação',
  },
  {
    id: 'laudo',
    label: 'Laudo Médico',
    shortLabel: 'Laudo',
  },
  {
    id: 'atestado_declaracao',
    label: 'Atestado / Declaração',
    shortLabel: 'Atestado',
  },
  {
    id: 'pedido_exames',
    label: 'Pedido de Exames',
    shortLabel: 'Exames',
  },
  {
    id: 'prescription',
    label: 'Prescrição Médica',
    shortLabel: 'Prescrição',
  },
  {
    id: 'consentimento_lgpd',
    label: 'Consentimento LGPD',
    shortLabel: 'LGPD',
  },
];

export const PATIENT = {
  name: 'Dara Amaral',
  age: 34,
  birthDate: '12/03/1991',
  gender: 'Feminino',
  record: 'PAC-004821',
};

export const EMPTY_DRAFTS = Object.fromEntries(
  TABS.map((tab) => [tab.id, { texto: '' }])
);
