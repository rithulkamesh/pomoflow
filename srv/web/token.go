package web

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/rithulkamesh/pomotimer/internal"
)

var SECRET = []byte(internal.Config.CookieSecret)

type Claims struct {
	Email string `json:"email"`
	Exp   int    `json:"exp:`
	jwt.RegisteredClaims
}

func CreateToken(email string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": email,
		"exp":   time.Now().Add(time.Hour * 720).Unix(),
	})

	tokenStr, err := token.SignedString(SECRET)
	if err != nil {
		return "", err
	}

	return tokenStr, nil
}

func DecodeToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return SECRET, nil
	}, jwt.WithLeeway(5*time.Second))

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	} else {
		return nil, err
	}
}
