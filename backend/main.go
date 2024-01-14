package main

import (
	"log"
	"os"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func main() {
	app := pocketbase.New()

	// If static file directory exists already, serve it.
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.GET("/*", apis.StaticDirectoryHandler(os.DirFS("./pb_public"), false))
		return nil
	})

	// app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
	// 	e.Router.GET("/ws", func(c echo.Context) error {

	// 		return c.JSON(200, map[string]interface{}{"hello": "world"})
	// 	})
	// 	return nil
	// })

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
