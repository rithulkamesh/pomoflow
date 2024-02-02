package main

import (
	"context"
	"log"
	"net/http"
	"slices"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"github.com/labstack/echo/v4"

	"google.golang.org/api/option"
)

type Session struct {
	ID                string    `json:"id"`
	IsRunning         bool      `json:"isRunning"`
	TimerType         TimerType `json:"timerType"`
	HostID            string    `json:"hostId"`
	SessionStarted    bool      `json:"sessionStarted"`
	CompletedSessions int       `json:"completedSessions"`
	PomodoroTime      int       `json:"pomodoroTime"`
	ShortBreakTime    int       `json:"shortBreakTime"`
	LongBreakTime     int       `json:"longBreakTime"`
	Guests            []string  `json:"guests"`
	PausedTimes       []Pauses  `json:"pausedTimes"`
	StartTime         int       `json:"startTime"`
}
type Pauses struct {
	StartTime int `json:"startTime"`
	EndTime   int `json:"endTime"`
}

type TimerType string

const (
	Pomodoro   TimerType = "Pomodoro"
	ShortBreak TimerType = "Short Break"
	LongBreak  TimerType = "Long Break"
)

func main() {
	e := echo.New()
	e.Use(FirestoreMiddleware)
	e.Use(AuthMiddleware)

	e.PUT("/sessions", createSession)
	e.GET("/sessions/:id", pingSession)
	e.DELETE("/sessions/:id", deleteSession)
	e.POST("/sessions/join/:id", joinSession)
	e.POST("/sessions/leave/:id", leaveSession)
	e.Logger.Fatal(e.Start("localhost:8000"))
}

func FirestoreMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := context.Background()
		opt := option.WithCredentialsFile("/home/rithulk/dev/pomotimer/backend/pomoflow-service-account-key.json")

		app, err := firebase.NewApp(ctx, nil, opt)
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

		return next(c)
	}
}

func AuthMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		auth := c.Get("auth").(*auth.Client)
		token, err := auth.VerifyIDToken(context.Background(), c.Request().Header.Get("Authorization"))
		c.Set("userID", token.UID)
		if err != nil {
			return c.String(http.StatusUnauthorized, "Unauthorized")
		}

		return next(c)
	}
}

func createSession(c echo.Context) error {
	return c.String(http.StatusOK, "Hello, World!")
}

func joinSession(c echo.Context) error {
	var session Session
	uid := c.Get("userID").(string)

	fs := c.Get("firestore").(*firestore.Client)
	doc, err := fs.Doc("sessions/" + c.Param("id")).Get(context.Background())

	if err != nil {
		return c.String(http.StatusNotFound, "Session not found")
	}

	doc.DataTo(&session)

	if uid == session.HostID || slices.Contains(session.Guests, uid) {
		return c.String(http.StatusOK, "OK")
	}

	session.Guests = append(session.Guests, uid)
	_, err = fs.Doc("sessions/"+c.Param("id")).Set(context.Background(), session)

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error updating session")
	}

	return c.String(http.StatusOK, "OK")
}

func pingSession(c echo.Context) error {

	fs := c.Get("firestore").(*firestore.Client)
	doc, err := fs.Doc("sessions/" + c.Param("id")).Get(context.Background())

	var session Session
	doc.DataTo(&session)

	if err != nil {
		return c.String(http.StatusNotFound, "Session not found")
	}

	return c.String(http.StatusOK, "OK")
}

func leaveSession(c echo.Context) error {
	var session Session
	uid := c.Get("userID").(string)

	fs := c.Get("firestore").(*firestore.Client)
	doc, err := fs.Doc("sessions/" + c.Param("id")).Get(context.Background())

	if err != nil {
		return c.String(http.StatusNotFound, "Session not found")
	}

	doc.DataTo(&session)

	if uid == session.HostID || !slices.Contains(session.Guests, uid) {
		return c.String(http.StatusOK, "OK")
	}

	for i, guest := range session.Guests {
		if guest == uid {
			session.Guests = append(session.Guests[:i], session.Guests[i+1:]...)
			break
		}
	}

	_, err = fs.Doc("sessions/"+c.Param("id")).Set(context.Background(), session)

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error updating session")
	}

	return c.String(http.StatusOK, "OK")
}

func deleteSession(c echo.Context) error {
	return c.String(http.StatusOK, "Hello, World!")
}
