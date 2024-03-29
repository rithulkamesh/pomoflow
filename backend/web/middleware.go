package web

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"firebase.google.com/go/auth"
	"github.com/labstack/echo/v4"
)

var LastGlobalHealthCheck int

func FirestoreMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := context.Background()

		app := GetFirebase()

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

		fmt.Println("Current last global health", LastGlobalHealthCheck)

		go checkGlobalHealth(firestore, &LastGlobalHealthCheck)

		return next(c)
	}
}

func checkGlobalHealth(firestore *firestore.Client, LastGlobalHealthCheck *int) {
	fmt.Println("Starting check global health")

	if int(time.Now().Unix())-*LastGlobalHealthCheck > 1800 {
		fmt.Println("Checking health - enough time passed since last check")
		*LastGlobalHealthCheck = int(time.Now().Unix())

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

		fmt.Println("Iterated through sessions and checked health. Exiting.")

		// iter = firestore.Collection("sessions").Where("deleted", "==", true).Documents(context.Background())
		// for {
		// 	doc, err := iter.Next()
		// 	if err != nil {
		// 		break
		// 	}
		// 	var session Session
		// 	doc.DataTo(&session)
		//
		// 	_, err = firestore.Doc("sessions/" + session.ID).Delete(context.Background())
		// 	if err != nil {
		// 		log.Println("Error deleting session")
		// 	}
		//
		// }
	}
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
