-- session_speakers: admins could not INSERT/UPDATE/DELETE (only public SELECT existed).
-- Programme "add" appeared to fail when speakers were selected, or edit speaker links broke silently.

CREATE POLICY "Admins manage session_speakers" ON session_speakers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'specialist')
  )
);
