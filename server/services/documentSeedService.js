const { query } = require("../db");

const DEFAULT_CSS = `
body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; padding: 40px; }
h1 { font-size: 20px; text-align: center; margin-bottom: 24px; }
.header { text-align: center; margin-bottom: 20px; }
.content { margin-bottom: 32px; }
.content p { margin-bottom: 8px; }
.footer { margin-top: 40px; text-align: center; }
.footer p { margin-bottom: 4px; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 13px; }
`;

const TEMPLATES = [
  {
    type: "certificate",
    name: "Atestado de Comparecimento",
    description: "Comprovante de presença do paciente na consulta.",
    template_html: `<!DOCTYPE html>
<html><head><style>{{{css}}}</style></head><body>
<div class="header"><h1>ATESTADO DE COMPARECIMENTO</h1></div>
<div class="content">
  <p>Atesto que <strong>{{patient_name}}</strong>, portador(a) do CPF {{patient_cpf}}, compareceu a esta consulta médica no dia {{consultation_date}}.</p>
  <p>Atenciosamente,</p>
</div>
<div class="footer">
  <p>_________________________________</p>
  <p>{{doctor_name}}</p>
  <p>CRM-{{doctor_crm_uf}} {{doctor_crm}}</p>
  <p>{{city}}, {{consultation_date}}</p>
</div>
</body></html>`,
  },
  {
    type: "sick_note",
    name: "Atestado Médico / Afastamento",
    description: "Atestado para afastamento do trabalho por motivo de saúde.",
    template_html: `<!DOCTYPE html>
<html><head><style>{{{css}}}</style></head><body>
<div class="header"><h1>ATESTADO MÉDICO</h1></div>
<div class="content">
  <p>Atesto para os devidos fins que <strong>{{patient_name}}</strong>, portador(a) do CPF {{patient_cpf}}, necessita de afastamento de suas atividades laborais por <strong>{{days_off}} dia(s)</strong>, a partir de {{start_date}}, por motivo de saúde.</p>
  <p>CID: {{cid_code}}</p>
  <p>Atenciosamente,</p>
</div>
<div class="footer">
  <p>_________________________________</p>
  <p>{{doctor_name}}</p>
  <p>CRM-{{doctor_crm_uf}} {{doctor_crm}}</p>
  <p>{{city}}, {{consultation_date}}</p>
</div>
</body></html>`,
  },
  {
    type: "exam_request",
    name: "Pedido de Exames",
    description: "Solicitação de exames laboratoriais ou de imagem.",
    template_html: `<!DOCTYPE html>
<html><head><style>{{{css}}}</style></head><body>
<div class="header"><h1>PEDIDO DE EXAMES</h1></div>
<div class="content">
  <p>Paciente: <strong>{{patient_name}}</strong></p>
  <p>CPF: {{patient_cpf}}</p>
  <p>Data: {{consultation_date}}</p>
  <h2>Exames Solicitados:</h2>
  <p>{{exams_list}}</p>
  <p>Hipótese Diagnóstica / Justificativa: {{diagnostic_hypothesis}}</p>
</div>
<div class="footer">
  <p>_________________________________</p>
  <p>{{doctor_name}}</p>
  <p>CRM-{{doctor_crm_uf}} {{doctor_crm}}</p>
</div>
</body></html>`,
  },
  {
    type: "report",
    name: "Laudo Médico",
    description: "Laudo descritivo de condição clínica.",
    template_html: `<!DOCTYPE html>
<html><head><style>{{{css}}}</style></head><body>
<div class="header"><h1>LAUDO MÉDICO</h1></div>
<div class="content">
  <p>Paciente: <strong>{{patient_name}}</strong>, CPF {{patient_cpf}}, {{patient_age}} anos.</p>
  <p>Data da avaliação: {{consultation_date}}</p>
  <p><strong>Histórico:</strong> {{history}}</p>
  <p><strong>Achados:</strong> {{findings}}</p>
  <p><strong>Conclusão:</strong> {{conclusion}}</p>
  <p>CID: {{cid_code}}</p>
</div>
<div class="footer">
  <p>_________________________________</p>
  <p>{{doctor_name}}</p>
  <p>CRM-{{doctor_crm_uf}} {{doctor_crm}}</p>
</div>
</body></html>`,
  },
  {
    type: "referral",
    name: "Encaminhamento",
    description: "Encaminhamento para especialista ou outro serviço.",
    template_html: `<!DOCTYPE html>
<html><head><style>{{{css}}}</style></head><body>
<div class="header"><h1>ENCAMINHAMENTO MÉDICO</h1></div>
<div class="content">
  <p>Encaminho <strong>{{patient_name}}</strong>, CPF {{patient_cpf}}, para avaliação com <strong>{{specialty}}</strong>.</p>
  <p><strong>Motivo:</strong> {{reason}}</p>
  <p><strong>Histórico Relevante:</strong> {{relevant_history}}</p>
  <p>CID: {{cid_code}}</p>
</div>
<div class="footer">
  <p>_________________________________</p>
  <p>{{doctor_name}}</p>
  <p>CRM-{{doctor_crm_uf}} {{doctor_crm}}</p>
  <p>{{city}}, {{consultation_date}}</p>
</div>
</body></html>`,
  },
  {
    type: "evolution",
    name: "Evolução Clínica",
    description: "Registro de evolução do quadro clínico.",
    template_html: `<!DOCTYPE html>
<html><head><style>{{{css}}}</style></head><body>
<div class="header"><h1>EVOLUÇÃO CLÍNICA</h1></div>
<div class="content">
  <p>Paciente: <strong>{{patient_name}}</strong></p>
  <p>Data: {{consultation_date}}</p>
  <p>{{content}}</p>
</div>
<div class="footer">
  <p>_________________________________</p>
  <p>{{doctor_name}}</p>
  <p>CRM-{{doctor_crm_uf}} {{doctor_crm}}</p>
</div>
</body></html>`,
  },
  {
    type: "prescription_simple",
    name: "Receita Simples",
    description: "Prescrição de medicamentos comuns.",
    template_html: `<!DOCTYPE html>
<html><head><style>{{{css}}}</style></head><body>
<div class="header"><h1>RECEITUÁRIO SIMPLES</h1></div>
<div class="content">
  <p>Paciente: <strong>{{patient_name}}</strong></p>
  <p>Data: {{consultation_date}}</p>
  <h2>Medicamentos:</h2>
  <table><thead><tr><th>Medicamento</th><th>Dosagem</th><th>Posologia</th></tr></thead><tbody>
  {{medications_rows}}
  </tbody></table>
</div>
<div class="footer">
  <p>_________________________________</p>
  <p>{{doctor_name}}</p>
  <p>CRM-{{doctor_crm_uf}} {{doctor_crm}}</p>
</div>
</body></html>`,
  },
  {
    type: "prescription_special",
    name: "Prescrição Especial (Controlados)",
    description: "Placeholder para prescrição de medicamentos controlados via Memed.",
    template_html: `<!DOCTYPE html>
<html><head><style>{{{css}}}</style></head><body>
<div class="header"><h1>RECEITUÁRIO DE CONTROLE ESPECIAL</h1></div>
<div class="content">
  <p>Paciente: <strong>{{patient_name}}</strong></p>
  <p>Data: {{consultation_date}}</p>
  <p><em>Esta prescrição será processada via plataforma Memed (Portaria 344/98).</em></p>
</div>
<div class="footer">
  <p>_________________________________</p>
  <p>{{doctor_name}}</p>
  <p>CRM-{{doctor_crm_uf}} {{doctor_crm}}</p>
</div>
</body></html>`,
  },
];

async function seedDocumentTemplates() {
  const { rows } = await query("SELECT COUNT(*)::int AS n FROM document_templates");
  if (rows[0].n > 0) return;

  for (const tpl of TEMPLATES) {
    await query(
      `INSERT INTO document_templates (type, name, description, template_html, css)
       VALUES ($1, $2, $3, $4, $5)`,
      [tpl.type, tpl.name, tpl.description, tpl.template_html, DEFAULT_CSS]
    );
  }

  console.log(`Seed: document_templates (${TEMPLATES.length} templates)`);
}

module.exports = { seedDocumentTemplates };
