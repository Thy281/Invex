CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

INSERT INTO roles (name, description) VALUES
    ('admin', 'Full system access'),
    ('manager', 'Operational management access'),
    ('operator', 'Daily operations access'),
    ('viewer', 'Read-only access');
