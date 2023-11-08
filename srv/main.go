package main

import (
	"log"

	"github.com/rithulkamesh/pomotimer/internal"
	"github.com/rithulkamesh/pomotimer/web"
)

func main() {
	if err := internal.LoadConfig(); err != nil {
		log.Fatal(err.Error())
	}

	if err := internal.InitDb(); err != nil {
		log.Fatal(err.Error())
	}
	web.Serve()
	defer internal.Db.Close()
}
