// src/database/shoppingRepository.js
import { getDb } from "./db";

// ── READ all items ordered by creation date ───────────────────────────────────
export async function getAllShoppingItems() {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT * FROM shopping_list ORDER BY created_at DESC`
  );
  return rows.map(dbRowToItem);
}

// ── INSERT new item ───────────────────────────────────────────────────────────
export async function insertShoppingItem(item) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO shopping_list (id, name, amount, unit, checked)
     VALUES (?, ?, ?, ?, ?)`,
    [item.id, item.name, item.amount ?? 0, item.unit ?? "", 0]
  );
}

// ── INSERT multiple items (from meal plan generation) ────────────────────────
export async function insertShoppingItems(items) {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const item of items) {
      // INSERT OR IGNORE — skip if the same id already exists
      // This prevents duplicating items if user generates list twice
      await db.runAsync(
        `INSERT OR IGNORE INTO shopping_list (id, name, amount, unit, checked)
         VALUES (?, ?, ?, ?, ?)`,
        [item.id, item.name, item.amount ?? 0, item.unit ?? "", 0]
      );
    }
  });
}

// ── TOGGLE checked state ──────────────────────────────────────────────────────
export async function toggleShoppingItem(id, currentChecked) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE shopping_list SET checked = ? WHERE id = ?`,
    [currentChecked ? 0 : 1, id]
  );
}

// ── DELETE single item ────────────────────────────────────────────────────────
export async function deleteShoppingItem(id) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM shopping_list WHERE id = ?`, [id]);
}

// ── DELETE all checked items ──────────────────────────────────────────────────
export async function deleteCheckedItems() {
  const db = await getDb();
  await db.runAsync(`DELETE FROM shopping_list WHERE checked = 1`);
}

// ── DELETE all items ──────────────────────────────────────────────────────────
export async function clearShoppingList() {
  const db = await getDb();
  await db.runAsync(`DELETE FROM shopping_list`);
}

function dbRowToItem(row) {
  return {
    id:      row.id,
    name:    row.name,
    amount:  row.amount,
    unit:    row.unit,
    checked: row.checked === 1,
  };
}