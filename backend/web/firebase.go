package web

import (
	"context"
	"fmt"
	"log"
	"os"

	firebase "firebase.google.com/go"
	"google.golang.org/api/option"
)

var app *firebase.App

func GetFirebase() *firebase.App {
	if app == nil {
		var err error
		app, err = InitFirebase()
		if err != nil {
			log.Fatalf("Error initializing Firebase app: %v", err)
		}
	}

	return app
}

func InitFirebase() (*firebase.App, error) {
	ctx := context.Background()

	location, exists := os.LookupEnv("FIRESTORE_SERVICE_ACCOUNT_PATH")

	if !exists {
		log.Fatalf("FIRESTORE_SERVICE_ACCOUNT_PATH not set in environment. \n")
		return nil, fmt.Errorf("FIRESTORE_SERVICE_ACCOUNT_PATH not set in environment. \n")
	}

	opt := option.WithCredentialsFile(location)

	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("Error initializing Firebase app: %v", err)
	}

	return app, nil
}
