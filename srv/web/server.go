package web

import (
	"fmt"

	"github.com/labstack/echo/v4"
	"github.com/rithulkamesh/pomotimer/internal"
)

var router *echo.Echo

func Serve() {
	router = echo.New()
	handleRoutes()

	router.Logger.Fatal(router.Start(fmt.Sprintf(":%d", internal.Config.Port)))
}

func handleRoutes() {
	AuthRoutes()
}
