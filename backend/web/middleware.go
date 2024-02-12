package web

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"github.com/labstack/echo/v4"
	"google.golang.org/api/option"
)

var LastGlobalHealthCheck int = 0

func FirestoreMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {

		ctx := context.Background()
		app, err := InitFirebase()

		if err != nil {
			log.Fatalf("Error initializing Firebase app: %v", err)
		}

		firestore, err := app.Firestore(ctx)
		if err != nil {
			log.Fatalf("Error creating Firestore client: %v", err)
		}
		defer firestore.Close()

		auth, err := app.Auth(ctx)
		if err != nil {
			log.Fatalf("error getting Auth client: %v\n", err)
		}

		c.Set("firestore", firestore)
		c.Set("auth", auth)

		go checkGlobalHealth(firestore, LastGlobalHealthCheck)

		return next(c)
	}
}

func checkGlobalHealth(firestore *firestore.Client, LastGlobalHealthCheck int) {
	if int(time.Now().Unix())-LastGlobalHealthCheck > 1800 {
		LastGlobalHealthCheck = int(time.Now().Unix())

		iter := firestore.Collection("sessions").Where("deleted", "==", false).Documents(context.Background())
		for {
			doc, err := iter.Next()
			if err != nil {
				break
			}
			var session Session
			doc.DataTo(&session)
			CheckSessionHealth(firestore, session.ID)
		}

		iter = firestore.Collection("sessions").Where("deleted", "==", true).Documents(context.Background())
		for {
			doc, err := iter.Next()
			if err != nil {
				break
			}
			var session Session
			doc.DataTo(&session)

			_, err = firestore.Doc("sessions/" + session.ID).Delete(context.Background())
			if err != nil {
				log.Println("Error deleting session")
			}

		}
	}
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

func AuthMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		auth := c.Get("auth").(*auth.Client)

		if c.Request().Header.Get("Authorization") == "" {
			return c.String(http.StatusUnauthorized, "Unauthorized")
		}

		token, err := auth.VerifyIDToken(context.Background(), c.Request().Header.Get("Authorization"))
		c.Set("userID", token.UID)
		if err != nil {
			return c.String(http.StatusUnauthorized, "Unauthorized")
		}

		return next(c)
	}
}
