db.run(`
  CREATE TABLE IF NOT EXISTS wifi_access(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT,
      voucher TEXT,
      start_time INTEGER,
      end_time INTEGER,
      mac_address TEXT,
      status TEXT
  )
`);
