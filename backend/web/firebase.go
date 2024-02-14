package web

import (
	"context"
	"encoding/base64"
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

	secret, err := getJsonSecret()
	if err != nil {
		fmt.Println("Error getting secret", err)
		return nil, err
	}

	opt := option.WithCredentialsJSON(secret)

	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("Error initializing Firebase app: %v", err)
	}

	return app, nil
}

func getJsonSecret() ([]byte, error) {
	location, exists := os.LookupEnv("FIRESTORE_SERVICE_ACCOUNT_PATH")
	value, valueExists := os.LookupEnv("FIRESTORE_SERVICE_ACCOUNT_JSON")

	if !exists && !valueExists {
		return []byte{}, fmt.Errorf("FIRESTORE_SERVICE_ACCOUNT_PATH and FIRESTORE_SERVICE_ACCOUNT_JSON not set")
	}

	if exists {
		value, err := os.ReadFile(location)
		return value, err
	}

	decodedBytes, err := base64.StdEncoding.DecodeString(value)

	if err != nil {
		return []byte{}, err
	}

	return decodedBytes, nil
}
