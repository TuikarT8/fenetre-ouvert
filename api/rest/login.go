package rest

import (
	"fenetre-ouverte/database"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/mitchellh/mapstructure"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
)

type LoginPageData struct {
	HasLoginErrors bool
	LoginError     string
}

var jwtKey string

func InitAuth() {
	jwtKey := os.Getenv("JWT_KEY")
	if jwtKey == "" {
		log.Fatal("JWT_KEY env variable must be set")
	}
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	email := r.FormValue("emailaddress")
	password := r.FormValue("password")

	var user = User{
		EmailAddress: email,
		Password:     password,
	}

	log.Println("This is the users", user.EmailAddress, user.Password)

	token, err := user.Authenticate()
	if err != nil {
		fmt.Printf("Error while authenticated user, err=[%v]", err)
	} else {
		setAuthenticationCookie(token, w)
		return
	}

}

func setAuthenticationCookie(token string, w http.ResponseWriter) {
	cookie := http.Cookie{
		Name:     "jwt",
		Value:    token,
		Path:     "/",
		MaxAge:   time.Now().Add(720 * time.Hour).Nanosecond(),
		HttpOnly: false, // TODO remove this in production
		Secure:   false, // TODO remove this in production
		SameSite: http.SameSiteLaxMode,
	}

	http.SetCookie(w, &cookie)
}

func areCredentialsValid(username, password string) bool {
	return username != "" && password != ""
}

func (user *User) Authenticate() (string, error) {
	var authToken AuthToken
	formPassword := user.Password

	result := database.Users.FindOne(
		database.Ctx,
		bson.M{
			"emailAddress": user.EmailAddress,
		},
	)
	if result.Err() != nil {
		return "", result.Err()
	}

	result.Decode(user)
	if comparePasswords(user.Password, []byte(formPassword)) {
		authToken.User = *user
		jwtToken, err := GenerateJWT(authToken)

		if err != nil {
			return "", fmt.Errorf("error while generating a JW token, err=[%v]\n", err)
		}

		return jwtToken, nil
	}

	return "", fmt.Errorf("invalid username or password ")
}

func GenerateJWT(claims AuthToken) (tokenString string, err error) {
	expirationTime := time.Now().Add(720 * time.Hour)
	claims.StandardClaims = jwt.StandardClaims{
		ExpiresAt: expirationTime.Unix(),
		IssuedAt:  time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err = token.SignedString([]byte(jwtKey))
	return
}

func comparePasswords(hashedPwd string, plainPwd []byte) bool {
	byteHash := []byte(hashedPwd)
	err := bcrypt.CompareHashAndPassword(byteHash, plainPwd)
	if err != nil {
		log.Println(err)
		return false
	}

	return true
}

func (user *User) Store() error {
	_, err := database.Users.InsertOne(database.Ctx, user)
	if err != nil {
		log.Printf("User::storeInDb() > error inserting User, %v\n", err)
		return err
	}

	return nil
}

func CompareHashAndPassword(tokenString string) (AuthToken, error) {
	var authToken AuthToken
	token, err := jwt.ParseWithClaims(tokenString, &authToken, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtKey), nil
	})

	if err != nil {
		return authToken, err
	}

	if token.Valid {
		err = mapstructure.Decode(token.Claims, &authToken)
		if err != nil {
			return authToken, err
		}
	}

	return authToken, nil
}
