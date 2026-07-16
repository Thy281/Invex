package dto

type CreateLocationRequest struct {
	Name    string  `json:"name" binding:"required"`
	Code    string  `json:"code" binding:"required"`
	Address *string `json:"address"`
	Active  bool    `json:"active"`
}

type UpdateLocationRequest struct {
	Name    *string `json:"name"`
	Code    *string `json:"code"`
	Address *string `json:"address"`
	Active  *bool   `json:"active"`
}
