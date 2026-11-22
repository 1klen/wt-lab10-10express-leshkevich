const express = require("express");
const pool = require("./db");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Express работает!");
});

app.get("/api/info", (req, res) => {
  res.json({
    application: "Web Technologies",
    technology: "Node.js + Express",
    database: "PostgreSQL"
  });
});

app.post("/api/test", (req, res) => {
  res.json({
    message: "Данные получены",
    data: req.body
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка подключения к базе данных" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Cars" ORDER BY "Id"');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка получения товаров" });
  }
});

app.get("/api/products/search", async (req, res) => {
  try {
    const queryText =
      req.query.name ?? req.query.brandModel ?? req.query.q ?? "";

    const result = await pool.query(
      `
      SELECT *
      FROM "Cars"
      WHERE "BrandModel" ILIKE $1
      ORDER BY "Id"
      `,
      [`%${queryText}%`]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка поиска" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Некорректный идентификатор" });
    }

    const result = await pool.query(
      'SELECT * FROM "Cars" WHERE "Id" = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Товар не найден" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка получения товара" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const brandModel = req.body.brandModel ?? req.body.name;
    const category = req.body.category;
    const rawPrice = req.body.pricePerDay ?? req.body.price;
    const pricePerDay = Number(rawPrice);
    const isAvailable = req.body.isAvailable;
    const description = req.body.description ?? "";

    if (
      !brandModel ||
      typeof brandModel !== "string" ||
      !category ||
      typeof category !== "string" ||
      rawPrice === undefined ||
      rawPrice === null ||
      Number.isNaN(pricePerDay) ||
      pricePerDay <= 0 ||
      typeof isAvailable !== "boolean"
    ) {
      return res.status(400).json({
        error: "Некорректные данные товара"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO "Cars"
        ("BrandModel", "Category", "PricePerDay", "IsAvailable", "Description")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [brandModel, category, pricePerDay, isAvailable, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка создания товара" });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Некорректный идентификатор" });
    }

    const brandModel = req.body.brandModel ?? req.body.name;
    const category = req.body.category;
    const pricePerDay = req.body.pricePerDay ?? req.body.price;
    const isAvailable = req.body.isAvailable ?? true;
    const description = req.body.description ?? "";

    const result = await pool.query(
      `
      UPDATE "Cars"
      SET
        "BrandModel" = $1,
        "Category" = $2,
        "PricePerDay" = $3,
        "IsAvailable" = $4,
        "Description" = $5
      WHERE "Id" = $6
      RETURNING *
      `,
      [brandModel, category, pricePerDay, isAvailable, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Товар не найден" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка изменения товара" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Некорректный идентификатор" });
    }

    const result = await pool.query(
      `
      DELETE FROM "Cars"
      WHERE "Id" = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Товар не найден"
      });
    }

    res.json({
      message: "Товар удалён",
      product: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Ошибка удаления товара"
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: "Маршрут не найден"
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server started on port ${port}`);
});