package main

import (
	"fenetre-ouverte/api/rest"

	"github.com/gorilla/mux"
)

func createRoutes() *mux.Router {
	r := mux.NewRouter()

	registerMiddlewares(r)
	createGoodsRoutes(r)
	createNotificationsRoutes(r)
	createUsersRoutes(r)
	createInvetorySessionsRoutes(r)
	createAssetRoutes(r)
	createAuthRoutes(r)
	createHistRoutes(r)

	return r
}

func registerMiddlewares(r *mux.Router) {
	r.Use(rest.AuthMiddleware)
}

func createGoodsRoutes(r *mux.Router) {
	r.HandleFunc("/api/goods", rest.GoodsHandler)
	r.HandleFunc("/api/goods/{id}", rest.GoodHandler)
	r.HandleFunc("/api/goods/{id}/changes", rest.CreateGoodChangeHandler)
	r.HandleFunc("/api/goods/{id}/changes/{sessionId}", rest.HandleGoodChangeOperation)
	r.HandleFunc("/api/goods/{id}/print", rest.HandlePrintLabel)
}

func createNotificationsRoutes(r *mux.Router) {
	r.HandleFunc("POST /api/notification", rest.HandleCreateNotificatio)
	r.HandleFunc("GET /api/notifications", rest.GetNotificationHandler)
	r.HandleFunc("DELETE /api/notifications/{id}", rest.HandleDeleteNotification)
	r.HandleFunc("PATCH /api/notifications/{id}", rest.UpdateNotificationHandler)
}

func createUsersRoutes(r *mux.Router) {
	r.HandleFunc("/api/users/{id}", rest.UserHandler)
}

func createInvetorySessionsRoutes(r *mux.Router) {
	r.HandleFunc("/api/sessions", rest.SessionsHandler)
	r.HandleFunc("/api/sessions/{id}", rest.SessionHandler)
	r.HandleFunc("/api/sessions/{id}/session", rest.UpdateSessionHandler)
	r.HandleFunc("/api/sessions/{id}/activate", rest.HandleActivateSession)
	r.HandleFunc("/api/sessions/{id}/goods", rest.GetSessionGoodsHandler)
	r.HandleFunc("/api/sessions/{id}/close", rest.CloseSessionHandler)
	r.HandleFunc("/api/hasActiveSession", rest.HasActiveSessionHandler)
}

func createAuthRoutes(r *mux.Router) {
	r.HandleFunc("/api/auth/verify", rest.HandleVerifyJwt)
	r.HandleFunc("/api/auth/login", rest.HandleLogin)
	r.HandleFunc("/api/auth/signup", rest.HandleSignupUser)
}

func createAssetRoutes(r *mux.Router) {
	r.HandleFunc("/assets/goods/{id}/qrcode", rest.HandleGenerateQrCode)
}

func createHistRoutes(r *mux.Router) {
	r.HandleFunc("/api/events", rest.HandleGetHistorique)
}
