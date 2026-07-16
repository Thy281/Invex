package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

var roleHierarchy = map[string]int{
	"admin":    100,
	"manager":  80,
	"operator": 60,
	"viewer":   40,
}

func RequireRole(minRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "no role found"})
			return
		}

		userLevel, ok := roleHierarchy[role.(string)]
		if !ok {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "invalid role"})
			return
		}

		requiredLevel, ok := roleHierarchy[minRole]
		if !ok {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "invalid required role"})
			return
		}

		if userLevel < requiredLevel {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
			return
		}

		c.Next()
	}
}
