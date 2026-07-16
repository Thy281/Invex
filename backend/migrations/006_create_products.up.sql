CREATE TABLE products (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name               VARCHAR(255) NOT NULL,
    sku                VARCHAR(100) UNIQUE NOT NULL,
    internal_code      VARCHAR(100),
    description        TEXT,
    category_id        UUID NOT NULL REFERENCES categories(id),
    unit_of_measure    VARCHAR(50) NOT NULL DEFAULT 'unit',
    min_stock          NUMERIC(15,3) NOT NULL DEFAULT 0,
    reorder_point      NUMERIC(15,3) NOT NULL DEFAULT 0,
    max_stock          NUMERIC(15,3) NOT NULL DEFAULT 0,
    unit_cost          NUMERIC(15,2) NOT NULL DEFAULT 0,
    primary_supplier_id UUID REFERENCES suppliers(id),
    active             BOOLEAN NOT NULL DEFAULT true,
    -- Barcode readiness
    ean                VARCHAR(13),
    upc                VARCHAR(12),
    barcode            VARCHAR(255),
    created_by         UUID REFERENCES users(id),
    updated_by         UUID REFERENCES users(id),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at         TIMESTAMPTZ
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(primary_supplier_id);
CREATE INDEX idx_products_active ON products(active);
