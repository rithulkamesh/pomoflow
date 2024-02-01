package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()
	e.PUT("/sessions/:id", createSession)
	e.POST("/sessions/:id", joinSession)
	e.GET("/sessions/:id", pingSession)
	e.DELETE("/sessions/:id", leaveSession)
	e.Logger.Fatal(e.Start(":8000"))
}

func createSession(c echo.Context) error {

	return c.String(http.StatusOK, "Hello, World!")
}

func joinSession(c echo.Context) error {
	return c.String(http.StatusOK, "Hello, World!")
}

func pingSession(c echo.Context) error {
	return c.String(http.StatusOK, "Hello, World!")
}

func leaveSession(c echo.Context) error {
	return c.String(http.StatusOK, "Hello, World!")
}
