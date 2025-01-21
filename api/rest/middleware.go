package rest

import (
	"context"
	"encoding/json"
	"fenetre-ouverte/api/tplt"
	"fenetre-ouverte/database"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

type ContextKey string

var permissions PermissionsDescriptor

func Init() {
	jsonfile, err := os.Open("permission.json")
	if err != nil {
		log.Println("Erreur survenu lors de la lecture du fichier json", err)
	}
	defer jsonfile.Close()

	bytesRead, _ := ioutil.ReadAll(jsonfile)

	json.Unmarshal(bytesRead, &permissions)
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if !strings.Contains(request.URL.Path, "/login") &&
			!strings.Contains(request.URL.Path, "/signup") &&
			!strings.Contains(request.URL.Path, "/verify") {
			user, err := authenticateRequest(writer, request)
			if err != nil {
				log.Printf("Error while authentcating request, err=[%v]", err)
				return
			}

			if !authorizeRequest(user, writer, request) {
				log.Println("Error while authorizing the request")
				return
			}

			cookie := http.Cookie{
				Name:     "user",
				Value:    user.Id.(string),
				Path:     "/",
				MaxAge:   time.Now().Add(720 * time.Hour).Nanosecond(),
				HttpOnly: false, // TODO remove this in production
				Secure:   false, // TODO remove this in production
				SameSite: http.SameSiteLaxMode,
			}

			http.SetCookie(writer, &cookie)

			newContext := context.WithValue(request.Context(), ContextKey("user"), user)
			enhancedRequest := request.WithContext(newContext)
			next.ServeHTTP(writer, enhancedRequest)
			return
		}

		next.ServeHTTP(writer, request)
	})
}

func authenticateRequest(w http.ResponseWriter, r *http.Request) (User, error) {
	user, err := verifyJwt(w, r)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		if strings.Contains(r.URL.Path, "/api") {
			jsondata, _ := json.Marshal(map[string]string{
				"error": "You are not authorized to access this resource",
				"code":  "E_ACCESS_DENIED",
			})
			_, _ = w.Write(jsondata)
			return user, fmt.Errorf("Autentication failed")
		}

		err := tplt.RenderTemplate(w, "401", nil)
		if err != nil {
			log.Printf("RenderNotFoundPage(): Error while rendering 404 template, err=[%v]", err)
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte("404 Not found"))
			return user, fmt.Errorf("Cannot render authentication error page")
		}

		return user, fmt.Errorf("Autentication failed")
	}

	return user, nil
}

func authorizeRequest(user User, w http.ResponseWriter, r *http.Request) bool {
	entity := getEntityFromRequest(r)
	operation := getOperationFromRequest(r)
	if entity == Entities_Unknown || entity == Entities_NoneEntity {
		return true
	}

	entity = strings.ToUpper(entity)
	entity = strings.TrimRight(entity, "S")
	if !user.HasPermission(fmt.Sprintf("%s_%s", operation, entity)) {
		w.WriteHeader(http.StatusForbidden)
		w.Write([]byte("403 Forbidden"))
		return false
	}

	return true
}

func getEntityFromRequest(r *http.Request) string {
	if !strings.Contains(r.URL.Path, "/api") {
		return Entities_NoneEntity
	}
	if strings.Contains(r.URL.Path, "/users") {
		return Entities_User
	}
	if strings.Contains(r.URL.Path, "/groups") {
		return Entities_Group
	}
	if strings.Contains(r.URL.Path, "/goods") {
		return Entities_Good
	}
	if strings.Contains(r.URL.Path, "/sessions") {
		return Entities_Session
	}
	if strings.Contains(r.URL.Path, "/events") {
		return Entities_Events
	}

	return Entities_Unknown
}

func getOperationFromRequest(r *http.Request) string {
	switch r.Method {
	case http.MethodPatch:
		return EntityOperation_Update
	case http.MethodPost:
		return EntityOperation_Write
	case http.MethodDelete:
		return EntityOperation_Write
	case http.MethodGet:
		return EntityOperation_Read
	default:
		return EntityOperation_Unknown
	}

	return EntityOperation_Unknown
}

func (user *User) loadRoles() error {
	var doc User
	result := database.Users.FindOne(ctx, bson.M{
		"emailAddress": user.EmailAddress,
	})

	err := result.Decode(&doc)
	if err != nil {
		log.Println("Error while to laoding user roles", err)
		return err
	}

	user.Roles = doc.Roles
	return nil
}
