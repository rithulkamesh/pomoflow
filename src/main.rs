mod prisma;
use axum::{response::Html, routing::get, Router};
use log::info;
use tokio::time::{Duration, Instant};

#[derive(Debug, Clone, Copy)]
enum TimerState {
    Running { start_time: Instant },
    Paused { remaining_time: Duration },
    Stopped,
}

#[tokio::main]
async fn main() {
    let app = Router::new().route("/", get(handler));

    info!("running on http://localhost:3000");
    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn handler() -> Html<&'static str> {
    Html("<h1>Hello, World!</h1>")
}
