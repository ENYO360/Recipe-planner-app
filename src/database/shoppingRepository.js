// src/database/shoppingRepository.js
import { getDb } from "./db";

export async function getAllShoppingItems() {
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT * FROM shopping_list ORDER BY created_at DESC`
  );
  return rows.map(dbRowToItem);
}

export async function insertShoppingItem(item) {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO shopping_list (id, name, amount, unit, checked)
     VALUES (?, ?, ?, ?, ?)`,
    [item.id, item.name, item.amount ?? 0, item.unit ?? "", item.checked ? 1 : 0]
  );
}

// ── Insert multiple items from meal plan generation ───────────────────────────
// Uses INSERT OR REPLACE so if the same ingredient already exists
// (from a previous generation) its amount gets updated, not skipped.
export async function insertShoppingItems(items) {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const item of items) {
      await db.runAsync(
        `INSERT OR REPLACE INTO shopping_list (id, name, amount, unit, checked)
         VALUES (?, ?, ?, ?, 0)`,
        [
          item.id,
          item.name,
          item.amount ?? 0,
          item.unit   ?? "",
        ]
      );
    }
  });
  console.log(`[shoppingRepository] Inserted/replaced ${items.length} items`);
}

export async function toggleShoppingItem(id, currentChecked) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE shopping_list SET checked = ? WHERE id = ?`,
    [currentChecked ? 0 : 1, id]
  );
}

export async function deleteShoppingItem(id) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM shopping_list WHERE id = ?`, [id]);
}

export async function deleteCheckedItems() {
  const db = await getDb();
  await db.runAsync(`DELETE FROM shopping_list WHERE checked = 1`);
}

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