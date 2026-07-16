CREATE TYPE movement_type AS ENUM ('in', 'out', 'transfer', 'adjustment');

CREATE TABLE stock_movements (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type              movement_type NOT NULL,
    product_id        UUID NOT NULL REFERENCES products(id),
    from_location_id  UUID REFERENCES locations(id),
    to_location_id    UUID REFERENCES locations(id),
    quantity          NUMERIC(15,3) NOT NULL,
    previous_quantity NUMERIC(15,3) NOT NULL DEFAULT 0,
    new_quantity      NUMERIC(15,3) NOT NULL DEFAULT 0,
    reason            TEXT NOT NULL,
    reference_type    VARCHAR(50),
    reference_id      UUID,
    user_id           UUID NOT NULL REFERENCES users(id),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_movements_product ON stock_movements(product_id);
CREATE INDEX idx_movements_user ON stock_movements(user_id);
CREATE INDEX idx_movements_type ON stock_movements(type);
CREATE INDEX idx_movements_created ON stock_movements(created_at DESC);
CREATE INDEX idx_movements_location_from ON stock_movements(from_location_id);
CREATE INDEX idx_movements_location_to ON stock_movements(to_location_id);
