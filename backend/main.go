package main

import (
	"context"
	"net/http"
	"slices"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/rithulkamesh/pomoflow/web"
)

func main() {
	e := echo.New()
	e.Use(web.FirestoreMiddleware)
	e.Use(web.AuthMiddleware)

	e.PUT("/sessions", createSession)
	e.GET("/sessions/:id", pingSession)
	e.DELETE("/sessions/:id", deleteSession)
	e.POST("/sessions/join/:id", joinSession)
	e.POST("/sessions/leave/:id", leaveSession)
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
		Guests:            []string{},
		PausedTimes:       []web.Pauses{},
		StartTime:         int(time.Now().Unix()),
	}
	_, err := fs.Doc("sessions/"+session.ID).Set(context.Background(), session)

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error creating session")
	}

	return c.JSON(http.StatusOK, map[string]string{"id": session.ID})
}

func joinSession(c echo.Context) error {
	var session web.Session
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
	_, err = fs.Doc("sessions/"+c.Param("id")).Update(context.Background(), []firestore.Update{{Path: "guests", Value: session.Guests}})

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error updating session")
	}

	return c.String(http.StatusOK, "OK")
}

func pingSession(c echo.Context) error {

	fs := c.Get("firestore").(*firestore.Client)
	doc, err := fs.Doc("sessions/" + c.Param("id")).Get(context.Background())

	var session web.Session
	doc.DataTo(&session)

	if err != nil {
		return c.String(http.StatusNotFound, "Session not found")
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

	if uid == session.HostID || !slices.Contains(session.Guests, uid) {
		return c.String(http.StatusOK, "OK")
	}

	for i, guest := range session.Guests {
		if guest == uid {
			session.Guests = append(session.Guests[:i], session.Guests[i+1:]...)
			break
		}
	}

	_, err = fs.Doc("sessions/"+c.Param("id")).Update(context.Background(), []firestore.Update{{Path: "guests", Value: session.Guests}})

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error updating session")
	}

	return c.String(http.StatusOK, "OK")
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

	_, err = fs.Doc("sessions/" + c.Param("id")).Delete(context.Background())

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error deleting session")
	}

	return c.String(http.StatusOK, "OK")
}
