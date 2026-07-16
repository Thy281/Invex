CREATE TABLE purchase_order_items (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    product_id        UUID NOT NULL REFERENCES products(id),
    quantity          NUMERIC(15,3) NOT NULL,
    unit_cost         NUMERIC(15,2) NOT NULL,
    total             NUMERIC(15,2) NOT NULL GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_po_items_order ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_po_items_product ON purchase_order_items(product_id);
