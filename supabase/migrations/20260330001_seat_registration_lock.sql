-- Atomic seat registration with FOR UPDATE lock
CREATE OR REPLACE FUNCTION register_for_session(
  p_session_id uuid,
  p_user_id uuid
) RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_session RECORD;
  v_existing RECORD;
  v_status text;
BEGIN
  -- Lock the session row to prevent race conditions
  SELECT id, capacity, registered_count, is_registration_open
    INTO v_session
    FROM event_sessions
    WHERE id = p_session_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Арга хэмжаа олдсонгүй');
  END IF;

  IF NOT v_session.is_registration_open THEN
    RETURN json_build_object('success', false, 'error', 'Бүртгэл хаагдсан');
  END IF;

  -- Check existing registration
  SELECT id, status INTO v_existing
    FROM seat_registrations
    WHERE session_id = p_session_id AND user_id = p_user_id;

  IF FOUND AND v_existing.status = 'confirmed' THEN
    RETURN json_build_object('success', false, 'error', 'Та аль хэдийн бүртгүүлсэн байна');
  END IF;

  -- Determine status
  IF v_session.capacity > 0 AND v_session.registered_count >= v_session.capacity THEN
    v_status := 'waitlisted';
  ELSE
    v_status := 'confirmed';
  END IF;

  -- Upsert registration
  INSERT INTO seat_registrations (session_id, user_id, status)
    VALUES (p_session_id, p_user_id, v_status)
    ON CONFLICT (session_id, user_id)
    DO UPDATE SET status = EXCLUDED.status, updated_at = now();

  -- Atomically increment registered_count only for confirmed
  IF v_status = 'confirmed' AND (NOT FOUND OR v_existing.status != 'confirmed') THEN
    UPDATE event_sessions
      SET registered_count = registered_count + 1
      WHERE id = p_session_id;
  END IF;

  RETURN json_build_object('success', true, 'status', v_status);
END;
$$;

-- Ensure unique constraint exists
ALTER TABLE seat_registrations
  ADD CONSTRAINT IF NOT EXISTS seat_registrations_session_user_unique
  UNIQUE (session_id, user_id);

-- Add updated_at if missing
ALTER TABLE seat_registrations
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION register_for_session(uuid, uuid) TO authenticated;
