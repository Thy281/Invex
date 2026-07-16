package dto

type UserDTO struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	RoleID string `json:"role_id"`
	Role   string `json:"role"`
	Active bool   `json:"active"`
	Theme  string `json:"theme"`
}

type PaginationParams struct {
	Page    int    `form:"page,default=1"`
	PerPage int    `form:"per_page,default=20"`
	Search  string `form:"search"`
	SortBy  string `form:"sort_by"`
	SortDir string `form:"sort_dir,default=asc"`
}

type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Total      int64       `json:"total"`
	Page       int         `json:"page"`
	PerPage    int         `json:"per_page"`
	TotalPages int         `json:"total_pages"`
}

type UpdateUserRequest struct {
	Theme *string `json:"theme"`
}

type APIError struct {
	Code    string            `json:"code"`
	Message string            `json:"message"`
	Details map[string]string `json:"details,omitempty"`
}
