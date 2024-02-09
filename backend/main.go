package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/rithulkamesh/pomoflow/web"
)

func init() {
	// loads values from .env into the system
	if err := godotenv.Load(); err != nil {
		log.Panic("Error loading .env file. Please add it to the root of the projec, and configure it according to .env.example. \n")
		return
	}

	log.Println("✅ Loaded .env file")
}

func main() {
	e := echo.New()

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowHeaders: []string{"Authorization", "content-type"},
		AllowOrigins: []string{"*"},
		AllowMethods: []string{http.MethodPost, http.MethodDelete},
	}))
	e.Use(web.FirestoreMiddleware)
	e.Use(web.AuthMiddleware)

	e.POST("/sessions", createSession)
	e.POST("/sessions/:id/ping", pingSession)
	e.DELETE("/sessions/:id", deleteSession)
	e.POST("/sessions/:id/join", joinSession)
	e.POST("/sessions/:id/leave", leaveSession)
	e.Logger.Fatal(e.Start("localhost:8000"))
}

type RequestBody struct {
	PomodoroTime   int `json:"pomodoroTime"`
	ShortBreakTime int `json:"shortBreakTime"`
	LongBreakTime  int `json:"longBreakTime"`
}

func createSession(c echo.Context) error {
	uid := c.Get("userID").(string)
	var body RequestBody

	if err := c.Bind(&body); err != nil {
		return c.String(http.StatusBadRequest, "Invalid request body")
	}

	if body.PomodoroTime < 1 || body.ShortBreakTime < 1 || body.LongBreakTime < 1 {
		return c.String(http.StatusBadRequest, "Invalid request body")
	}

	fs := c.Get("firestore").(*firestore.Client)
	session := web.Session{
		ID:                uuid.New().String(),
		IsRunning:         false,
		TimerType:         web.Pomodoro,
		HostID:            uid,
		SessionStarted:    false,
		CompletedSessions: 0,
		PomodoroTime:      body.PomodoroTime,
		ShortBreakTime:    body.ShortBreakTime,
		LongBreakTime:     body.LongBreakTime,
		PausedTimes:       []web.Pauses{},
		StartTime:         int(time.Now().Unix()),
		CreatedAt:         int(time.Now().Unix()),
	}
	_, err := fs.Doc("sessions/"+session.ID).Set(context.Background(), session)

	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusInternalServerError, "Error creating session")
	}

	return c.JSON(http.StatusOK, map[string]string{"id": session.ID})
}

func joinSession(c echo.Context) error {
	var session web.Session
	var user web.Guest
	uid := c.Get("userID").(string)

	fs := c.Get("firestore").(*firestore.Client)
	doc, err := fs.Doc("sessions/" + c.Param("id")).Get(context.Background())

	if err != nil {
		return c.String(http.StatusNotFound, "Session not found")
	}

	doc.DataTo(&session)

	doc, err = fs.Doc("users/" + uid).Get(context.Background())

	if err != nil {
		return c.String(http.StatusNotFound, "User not found")
	}

	doc.DataTo(&user)

	user.LastPingTime = int(time.Now().Unix())
	existingGuest, err := fs.Doc(fmt.Sprintf("sessions/%s/guests/%s", c.Param("id"), uid)).Get(context.Background())

	if uid == session.HostID || (existingGuest != nil && err == nil && existingGuest.Exists()) {
		path := "sessions/" + c.Param("id") + "/guests/" + uid
		_, err = fs.Doc(path).Set(context.Background(), user)

		if err != nil {
			return c.String(http.StatusInternalServerError, "Error updating session")
		}

		return c.String(http.StatusOK, "OK")
	}

	// session.Guests = append(session.Guests, uid)
	// _, err = fs.Doc("sessions/"+c.Param("id")).Update(context.Background(), []firestore.Update{{Path: "guests", Value: session.Guests}})

	_, err = fs.Doc(fmt.Sprintf("sessions/%s/guests/%s", c.Param("id"), uid)).Set(context.Background(), web.Guest{ID: uid, LastPingTime: int(time.Now().Unix())})

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error updating session")
	}

	return c.String(http.StatusOK, "OK")
}

func pingSession(c echo.Context) error {
	userId := c.Get("userID").(string)
	sessionID := c.Param("id")

	fs := c.Get("firestore").(*firestore.Client)
	path := fmt.Sprintf("sessions/%s/guests/%s", sessionID, userId)
	doc, err := fs.Doc(path).Get(context.Background())

	if err != nil {
		log.Println(err)
		return c.String(http.StatusNotFound, "Session not found OR user is not part of it.")
	}

	var guest web.Guest
	doc.DataTo(&guest)

	// update ping time

	guest.LastPingTime = int(time.Now().Unix())
	_, err = fs.Doc("sessions/"+c.Param("id")+"/guests/"+userId).Set(context.Background(), guest)

	if err != nil {
		c.Logger().Errorf("Failed to update user, error: %v", err)
		return c.String(http.StatusInternalServerError, "Error updating session")
	}

	return c.String(http.StatusOK, "OK")
}

func leaveSession(c echo.Context) error {
	var session web.Session
	uid := c.Get("userID").(string)

	fs := c.Get("firestore").(*firestore.Client)
	doc, err := fs.Doc("sessions/" + c.Param("id")).Get(context.Background())

	if err != nil {
		return c.String(http.StatusNotFound, "Session not found")
	}

	doc.DataTo(&session)

	if uid == session.HostID {
		return c.String(http.StatusTeapot, "Can't really leave if you'e the host, can you?")
	}

	guest, err := fs.Doc("sessions/" + c.Param("id") + "/guests/" + uid).Get(context.Background())

	if err != nil || !guest.Exists() {
		return c.String(http.StatusNotFound, "User not found in session")
	}

	_, err = fs.Doc("sessions/" + c.Param("id") + "/guests/" + uid).Delete(context.Background())

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error deleting user from session.")
	}

	return c.String(http.StatusOK, "Yanked from session.")
}

func deleteSession(c echo.Context) error {
	var session web.Session
	uid := c.Get("userID").(string)

	fs := c.Get("firestore").(*firestore.Client)
	doc, err := fs.Doc("sessions/" + c.Param("id")).Get(context.Background())

	if err != nil {
		return c.String(http.StatusNotFound, "Session not found")
	}

	doc.DataTo(&session)

	if uid != session.HostID {
		return c.String(http.StatusUnauthorized, "Unauthorized")
	}

	_, err = fs.Doc("sessions/"+c.Param("id")).Update(context.Background(), []firestore.Update{{Path: "deleted", Value: true}})

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error deleting session")
	}

	return c.String(http.StatusOK, "OK")
}
