package web

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
	// Guests            []string  `json:"guests" firestore:"guests"`
	PausedTimes []Pauses `json:"pausedTimes" firestore:"pausedTimes"`
	StartTime   int      `json:"startTime" firestore:"startTime"`
}

type Pauses struct {
	StartTime int `json:"startTime" firestore:"startTime"`
	EndTime   int `json:"endTime" firestore:"endTime"`
}

type Guests struct {
	ID           string `json:"id" firestore:"id"`
	LastPingTime int    `json:"lastPingTime" firestore:"lastPingTime"`
}

type TimerType string

type User struct {
	ID string `json:"id" firestore:"id"`
}

const (
	Pomodoro   TimerType = "Pomodoro"
	ShortBreak TimerType = "Short Break"
	LongBreak  TimerType = "Long Break"
)