package web

import (
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
	"github.com/rithulkamesh/pomotimer/internal"
)

type ReqBody struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func AuthRoutes() {
	r := router.Group("/auth")
	r.POST("/", login)
	r.GET("/", logout)
	r.PUT("/", register)

	d := router.Group("/user")
	d.Use(echojwt.WithConfig(echojwt.Config{
		SigningKey:  SECRET,
		TokenLookup: "cookie:Token",
	}))
	d.DELETE("/", delacc)
	d.GET("/", getuser)
}

func getuser(c echo.Context) error {
	cookie, err := c.Cookie("Token")
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}

	claims, err := DecodeToken(cookie.Value)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	user, err := internal.GetUser(claims.Email)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err)
	}

	return c.JSONPretty(http.StatusOK, &user, "  ")
}

func register(c echo.Context) error {
	var d ReqBody

	err := c.Bind(&d)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}

	u, err := internal.GetUser(d.Email)

	if u != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "email already in use.")
	}
	msg, err := internal.CreateUser(d.Email, d.Password)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.String(http.StatusOK, msg)
}

func login(c echo.Context) error {
	var d ReqBody

	err := c.Bind(&d)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "bad request")
	}

	user, err := internal.GetUser(d.Email)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	valid, err := user.VerifyPassword(d.Password)

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	if !valid {
		return echo.NewHTTPError(http.StatusUnauthorized, "Please provide valid credentials")
	}

	token, err := CreateToken(d.Email)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	cookie := new(http.Cookie)
	cookie.Name = "Token"
	cookie.Value = token
	cookie.Path = "/"
	cookie.Expires = time.Now().Add(time.Hour * 720)

	c.SetCookie(cookie)
	return c.String(http.StatusOK, "OK")
}

func logout(c echo.Context) error {
	cookie := new(http.Cookie)
	cookie.Name = "Token"
	cookie.Value = ""
	cookie.Path = "/"
	cookie.MaxAge = -1

	c.SetCookie(cookie)
	return c.String(http.StatusOK, "OK")
}

func delacc(c echo.Context) error {
	cl := c.Get("user").(*jwt.Token).Claims.(jwt.MapClaims)["email"].(string)

	err := internal.DeleteUser(cl)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())

	}

	cookie := new(http.Cookie)
	cookie.Name = "Token"
	cookie.Value = ""
	cookie.Path = "/"
	cookie.MaxAge = -1

	c.SetCookie(cookie)

	return c.String(http.StatusOK, "OK")
}
