import db from "../utils/db.js";

export const authorizeDevice = async (req, res) => {
  const { mac } = req.query;

  const row = await db.get(
    "SELECT * FROM sessions WHERE mac = ? ORDER BY id DESC LIMIT 1",
    [mac]
  );

  if (!row) return res.json({ status: "no_record" });

  if (row.status !== "paid") return res.json({ status: "unpaid" });

  res.json({
    status: "paid",
    minutes: row.minutes
  });
};