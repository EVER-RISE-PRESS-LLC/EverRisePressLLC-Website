/** A single conditional insert keeps repeated requests from creating a lead twice. */
export async function recordChapterLead(db: D1Database, input: {
  email: string; bookId: string; partnerId: string | null; sourceUtm: string | null;
}): Promise<boolean> {
  const email = input.email.trim().toLowerCase();
  const inserted = await db.prepare(`
    INSERT INTO leads (id, email, book_id, partner_id, source_utm)
    SELECT ?, ?, ?, ?, ?
    WHERE NOT EXISTS (SELECT 1 FROM leads WHERE lower(trim(email)) = ? AND book_id = ?)
  `).bind(crypto.randomUUID(), email, input.bookId, input.partnerId, input.sourceUtm, email, input.bookId).run();
  const isNewLead = inserted.meta.changes === 1;
  if (!isNewLead && input.partnerId) {
    await db.prepare(`UPDATE leads SET partner_id = ?
      WHERE lower(trim(email)) = ? AND book_id = ? AND partner_id IS NULL`)
      .bind(input.partnerId, email, input.bookId).run();
  }
  return isNewLead;
}
