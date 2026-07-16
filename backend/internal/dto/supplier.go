package dto

type CreateSupplierRequest struct {
	Name          string  `json:"name" binding:"required"`
	TaxID         string  `json:"tax_id" binding:"required"`
	Email         *string `json:"email"`
	Phone         *string `json:"phone"`
	Address       *string `json:"address"`
	ContactPerson *string `json:"contact_person"`
	Active        bool    `json:"active"`
}

type UpdateSupplierRequest struct {
	Name          *string `json:"name"`
	TaxID         *string `json:"tax_id"`
	Email         *string `json:"email"`
	Phone         *string `json:"phone"`
	Address       *string `json:"address"`
	ContactPerson *string `json:"contact_person"`
	Active        *bool   `json:"active"`
}
