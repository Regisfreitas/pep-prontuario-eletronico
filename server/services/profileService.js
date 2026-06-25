const { query } = require("../db");
const { pool } = require("../db");

async function getStates() {
  const { rows } = await query(
    "SELECT id, name, abbreviation FROM states ORDER BY name"
  );
  return rows;
}

async function getSpecialties() {
  const { rows } = await query(
    "SELECT id, name FROM specialties ORDER BY name"
  );
  return rows;
}

async function getProfile(doctorId) {
  const { rows } = await query(
    `SELECT
       d.id,
       d.nome,
       d.first_name,
       d.last_name,
       d.cpf,
       d.birth_date,
       d.gender,
       d.email,
       d.phone,
       d.board_type,
       d.crm,
       d.crm_uf,
       d.req_number,
       d.state_id,
       d.specialty_id,
       s.name AS specialty_name,
       st.abbreviation AS state_abbreviation
     FROM doctors d
     LEFT JOIN specialties s ON s.id = d.specialty_id
     LEFT JOIN states st ON st.id = d.state_id
     WHERE d.id = $1`,
    [Number(doctorId)]
  );
  return rows[0] ?? null;
}

async function updateProfile(doctorId, data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const fields = [];
    const values = [];
    let idx = 1;

    const allowed = [
      "first_name",
      "last_name",
      "cpf",
      "birth_date",
      "gender",
      "email",
      "phone",
      "board_type",
      "crm",
      "crm_uf",
      "state_id",
      "specialty_id",
      "req_number",
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx}`);

        // Garantir que state_id e specialty_id sejam números
        if (key === "state_id" || key === "specialty_id") {
          values.push(data[key] ? Number(data[key]) : null);
        } else {
          values.push(data[key]);
        }
        idx++;
      }
    }

    if (fields.length === 0) {
      await client.query("ROLLBACK");
      return getProfile(doctorId);
    }

    // Atualizar nome completo a partir de first_name + last_name
    if (data.first_name || data.last_name) {
      const { rows: current } = await client.query(
        "SELECT first_name, last_name FROM doctors WHERE id = $1",
        [Number(doctorId)]
      );
      const fn = data.first_name ?? current[0]?.first_name ?? "";
      const ln = data.last_name ?? current[0]?.last_name ?? "";
      fields.push(`nome = $${idx}`);
      values.push(`${fn} ${ln}`.trim());
      idx++;
    }

    values.push(Number(doctorId));
    await client.query(
      `UPDATE doctors SET ${fields.join(", ")} WHERE id = $${idx}`,
      values
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  return getProfile(doctorId);
}

module.exports = { getStates, getSpecialties, getProfile, updateProfile };
