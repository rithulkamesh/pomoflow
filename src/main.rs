mod prisma;
use axum::{http::Response, routing::get, Router};
use log::trace;
use std::sync::{Arc, Mutex};
use tokio::time::Duration;

#[derive(Debug, Clone, Copy)]
enum TimerState {
    Paused { remaining_time: Duration },
}

#[tokio::main]
async fn main() {
    let timer_state = Arc::new(Mutex::new(TimerState::Paused {
        remaining_time: Duration::from_secs(25 * 60),
    }));
    let timer_state_clone = timer_state.clone();

    let app = Router::new().route(
        "/status",
        get(move || status_handler(timer_state_clone.clone())),
    );

    trace!("running on http://localhost:3000");
    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn status_handler(timer_state: Arc<Mutex<TimerState>>) -> Response<String> {
    let state = timer_state.lock().unwrap();
    let status = match *state {
        TimerState::Paused { remaining_time } => {
            format!("Paused, Remaining time: {:?}", remaining_time)
        }
    };
    Response::new(status)
}
