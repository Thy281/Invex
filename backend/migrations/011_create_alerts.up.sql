CREATE TYPE alert_type AS ENUM (
    'low_stock', 'reorder_point', 'out_of_stock', 'po_delayed', 'suspicious_adjustment'
);

CREATE TABLE alerts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type        alert_type NOT NULL,
    product_id  UUID REFERENCES products(id),
    location_id UUID REFERENCES locations(id),
    message     TEXT NOT NULL,
    read        BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_read ON alerts(read);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);

CREATE TABLE alert_configs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type      alert_type NOT NULL,
    product_id      UUID REFERENCES products(id),
    category_id     UUID REFERENCES categories(id),
    location_id     UUID REFERENCES locations(id),
    custom_threshold NUMERIC(15,3),
    active          BOOLEAN NOT NULL DEFAULT true,
    notify_email    BOOLEAN NOT NULL DEFAULT false,
    notify_internal BOOLEAN NOT NULL DEFAULT true,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
