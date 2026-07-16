package services

import (
	"testing"

	"github.com/hugoquesada/invex/internal/dto"
)

func TestStockInRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		req     dto.StockInRequest
		wantErr bool
	}{
		{
			name: "valid request",
			req: dto.StockInRequest{
				ProductID:  "prod-1",
				LocationID: "loc-1",
				Quantity:   10,
				Reason:     "Restock",
			},
			wantErr: false,
		},
		{
			name: "zero quantity",
			req: dto.StockInRequest{
				ProductID:  "prod-1",
				LocationID: "loc-1",
				Quantity:   0,
				Reason:     "Test",
			},
			wantErr: true,
		},
		{
			name: "negative quantity",
			req: dto.StockInRequest{
				ProductID:  "prod-1",
				LocationID: "loc-1",
				Quantity:   -5,
				Reason:     "Test",
			},
			wantErr: true,
		},
		{
			name: "missing product_id",
			req: dto.StockInRequest{
				LocationID: "loc-1",
				Quantity:   10,
				Reason:     "Test",
			},
			wantErr: true,
		},
		{
			name: "missing reason",
			req: dto.StockInRequest{
				ProductID:  "prod-1",
				LocationID: "loc-1",
				Quantity:   10,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			hasErr := tt.req.ProductID == "" || tt.req.LocationID == "" || tt.req.Reason == "" || tt.req.Quantity <= 0
			if hasErr != tt.wantErr {
				t.Errorf("expected error=%v, got hasErr=%v", tt.wantErr, hasErr)
			}
		})
	}
}

func TestStockOutRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		req     dto.StockOutRequest
		wantErr bool
	}{
		{
			name: "valid request",
			req: dto.StockOutRequest{
				ProductID:  "prod-1",
				LocationID: "loc-1",
				Quantity:   5,
				Reason:     "Sale",
			},
			wantErr: false,
		},
		{
			name: "zero quantity",
			req: dto.StockOutRequest{
				ProductID:  "prod-1",
				LocationID: "loc-1",
				Quantity:   0,
				Reason:     "Test",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			hasErr := tt.req.ProductID == "" || tt.req.LocationID == "" || tt.req.Reason == "" || tt.req.Quantity <= 0
			if hasErr != tt.wantErr {
				t.Errorf("expected error=%v, got hasErr=%v", tt.wantErr, hasErr)
			}
		})
	}
}

func TestTransferRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		req     dto.TransferRequest
		wantErr bool
	}{
		{
			name: "valid transfer",
			req: dto.TransferRequest{
				ProductID:      "prod-1",
				FromLocationID: "loc-1",
				ToLocationID:   "loc-2",
				Quantity:       10,
				Reason:         "Reallocation",
			},
			wantErr: false,
		},
		{
			name: "same location",
			req: dto.TransferRequest{
				ProductID:      "prod-1",
				FromLocationID: "loc-1",
				ToLocationID:   "loc-1",
				Quantity:       10,
				Reason:         "Test",
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			hasErr := tt.req.ProductID == "" || tt.req.FromLocationID == "" || tt.req.ToLocationID == "" || tt.req.Reason == "" || tt.req.Quantity <= 0
			if hasErr != tt.wantErr {
				t.Errorf("expected error=%v, got hasErr=%v", tt.wantErr, hasErr)
			}
		})
	}
}

func TestAdjustmentRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		req     dto.AdjustmentRequest
		wantErr bool
	}{
		{
			name: "valid adjustment",
			req: dto.AdjustmentRequest{
				ProductID:   "prod-1",
				LocationID:  "loc-1",
				NewQuantity: 50,
				Reason:      "Cycle count correction",
			},
			wantErr: false,
		},
		{
			name: "zero new quantity",
			req: dto.AdjustmentRequest{
				ProductID:   "prod-1",
				LocationID:  "loc-1",
				NewQuantity: 0,
				Reason:      "Write off",
			},
			wantErr: false,
		},
		{
			name: "missing reason",
			req: dto.AdjustmentRequest{
				ProductID:   "prod-1",
				LocationID:  "loc-1",
				NewQuantity: 100,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			hasErr := tt.req.ProductID == "" || tt.req.LocationID == "" || tt.req.Reason == ""
			if hasErr != tt.wantErr {
				t.Errorf("expected error=%v, got hasErr=%v", tt.wantErr, hasErr)
			}
		})
	}
}
