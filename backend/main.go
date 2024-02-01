package main

import (
	"context"
	"log"
	"net/http"

	firebase "firebase.google.com/go"
	"github.com/labstack/echo/v4"
	"google.golang.org/api/option"
)

func main() {
	e := echo.New()
	e.Use(FirestoreMiddleware)

	e.PUT("/sessions/:id", createSession)
	e.POST("/sessions/:id", joinSession)
	e.GET("/sessions/:id", pingSession)
	e.DELETE("/sessions/:id", leaveSession)
	e.Logger.Fatal(e.Start(":8000"))
}

func FirestoreMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := context.Background()
		opt := option.WithCredentialsFile("pomoflow-service-account-key.json")

		app, err := firebase.NewApp(ctx, nil, opt)
		if err != nil {
			log.Fatalf("Error initializing Firebase app: %v", err)
		}

		client, err := app.Firestore(ctx)
		if err != nil {
			log.Fatalf("Error creating Firestore client: %v", err)
		}
		defer client.Close()

		c.Set("firestore", client)

		return next(c)
	}
}

func createSession(c echo.Context) error {

	return c.String(http.StatusOK, "Hello, World!")
}

func joinSession(c echo.Context) error {
	return c.String(http.StatusOK, "Hello, World!")
}

func pingSession(c echo.Context) error {

	return c.String(http.StatusOK, "Pong")
}

func leaveSession(c echo.Context) error {
	return c.String(http.StatusOK, "Hello, World!")
}
