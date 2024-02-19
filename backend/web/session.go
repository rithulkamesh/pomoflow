package web

import (
	"context"
	"fmt"
	"time"

	"cloud.google.com/go/firestore"
)

type Session struct {
	ID                string    `json:"id" firestore:"id"`
	IsRunning         bool      `json:"isRunning" firestore:"isRunning"`
	TimerType         TimerType `json:"timerType" firestore:"timerType"`
	HostID            string    `json:"hostId" firestore:"hostId"`
	SessionStarted    bool      `json:"sessionStarted" firestore:"sessionStarted"`
	CompletedSessions int       `json:"completedSessions" firestore:"completedSessions"`
	PomodoroTime      int       `json:"pomodoroTime" firestore:"pomodoroTime"`
	ShortBreakTime    int       `json:"shortBreakTime" firestore:"shortBreakTime"`
	LongBreakTime     int       `json:"longBreakTime" firestore:"longBreakTime"`
	PausedTimes       []Pauses  `json:"pausedTimes" firestore:"pausedTimes"`
	StartTime         int       `json:"startTime" firestore:"startTime"`
	LastHealthCheck   int       `json:"lastPingTime" firestore:"lastHealthCheck"`

	CreatedAt int `json:"createdAt" firestore:"createdAt"`
}

type Pauses struct {
	StartTime int `json:"startTime" firestore:"startTime"`
	EndTime   int `json:"endTime" firestore:"endTime"`
}

type Guest struct {
	ID           string `json:"id" firestore:"id"`
	Name         string `json:"name" firestore:"name"`
	LastPingTime int    `json:"lastPingTime" firestore:"lastPingTime"`
}

type TimerType string

type User struct {
	ID   string `json:"id" firestore:"id"`
	Name string `json:"name" firestore:"name"`
}

const (
	Pomodoro   TimerType = "Pomodoro"
	ShortBreak TimerType = "Short Break"
	LongBreak  TimerType = "Long Break"
)

func CheckSessionHealth(fs *firestore.Client, sessionID string) error {
	path := "sessions/" + sessionID + "/guests"
	iter := fs.Collection(path).Documents(context.Background())

	var guests []Guest
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		var guest Guest
		doc.DataTo(&guest)
		guests = append(guests, guest)
	}

	fmt.Println("Checking health for session", sessionID, " with ", len(guests), " guests")

	for i, guest := range guests {
		fmt.Println(("Guest last ping time: "), guest.LastPingTime)
		if int(time.Now().Unix())-guest.LastPingTime > 30 {
			fmt.Println("Deleting guest", guest.ID)
			_, err := fs.Doc("sessions/" + sessionID + "/guests/" + guest.ID).Delete(context.Background())
			if err != nil {
				return fmt.Errorf("error deleting guest")
			}

			fmt.Println("Deleting guest from array")

			prevLength := len(guests)
			guests = append(guests[:i-1], guests[i+1:]...)

			if len(guests) == prevLength {
				fmt.Printf("Guest not deleted, array length is %v", len(guests))
			}
		}
	}

	if len(guests) == 0 {
		fmt.Println("Deleting session", sessionID)
		_, err := fs.Doc("sessions/"+sessionID).Update(context.Background(), []firestore.Update{{Path: "deleted", Value: true}})
		if err != nil {
			return fmt.Errorf("error deleting session")
		}
	} else {
		fmt.Println("Updating session", sessionID, " with ", len(guests), " guests")
		_, err := fs.Doc("sessions/"+sessionID).Update(context.Background(), []firestore.Update{{Path: "lastHealthCheck", Value: int(time.Now().Unix())}})
		if err != nil {
			return fmt.Errorf("error updating session")
		}
	}

	return nil
}
