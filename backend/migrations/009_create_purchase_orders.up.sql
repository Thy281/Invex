CREATE TYPE po_status AS ENUM ('draft', 'pending', 'approved', 'sent', 'received', 'cancelled');

CREATE TABLE purchase_orders (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id            UUID NOT NULL REFERENCES suppliers(id),
    destination_location_id UUID NOT NULL REFERENCES locations(id),
    status                 po_status NOT NULL DEFAULT 'draft',
    expected_date          DATE,
    notes                  TEXT,
    auto_generated         BOOLEAN NOT NULL DEFAULT false,
    created_by             UUID NOT NULL REFERENCES users(id),
    updated_by             UUID REFERENCES users(id),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at             TIMESTAMPTZ
);

CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_expected_date ON purchase_orders(expected_date);
