package rest

import (
	"encoding/json"
	"fenetre-ouverte/api/utils"
	"fenetre-ouverte/database"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/gorilla/mux"
	"github.com/mitchellh/mapstructure"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
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

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	email := r.FormValue("emailaddress")
	password := r.FormValue("password")

	var user = User{
		EmailAddress: email,
		Password:     password,
	}

	token, err := user.Authenticate()
	if err != nil {
		fmt.Printf("Error while authenticated user, err=[%v]", err)
		return
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

func HandleVerifyJwt(w http.ResponseWriter, r *http.Request) {
	var user User
	var err error

	if user, err = verifyJwt(w, r); err != nil {
		jsondata, _ := json.Marshal(map[string]bool{
			"valid": false,
		})
		w.WriteHeader(http.StatusUnauthorized)
		w.Header().Add("Content-Type", "application/json")
		w.Write(jsondata)
		return
	}

	user, err = getOneUser(user.Id.(string))
	if err != nil {
		log.Printf("Error while autheticateing user, %v", err)
		jsondata, _ := json.Marshal(map[string]bool{
			"valid": false,
		})
		w.WriteHeader(http.StatusInternalServerError)
		w.Header().Add("Content-Type", "application/json")
		w.Write(jsondata)
		return
	}

	jsondata, _ := json.Marshal(map[string]any{
		"valid": true,
		"roles": user.Roles,
	})
	w.Write([]byte(jsondata))
}

func verifyJwt(w http.ResponseWriter, r *http.Request) (User, error) {
	var decoded AuthToken
	var user User

	cookie, err := r.Cookie("jwt")
	if err != nil || cookie.Value == "" {
		return user, fmt.Errorf("Cannot find JWT token in the request")
	}

	decoded, err = decodeToken(cookie.Value)
	if err != nil {
		log.Printf(" the jwt is not valid, %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("HandleVerifyJwt () => the jwt is not valid"))
	}

	if err = decoded.Valid(); err == nil {
		return decoded.User, nil
	}

	return user, err
}

func decodeToken(tokenString string) (AuthToken, error) {
	var decoded AuthToken
	token, err := jwt.ParseWithClaims(tokenString, &decoded, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtKey), nil
	})

	if err != nil {
		return decoded, err
	}

	if token.Valid {
		err = mapstructure.Decode(token.Claims, &decoded)
		if err != nil {
			return decoded, err
		}
	}

	return decoded, nil
}

func HandleUpdatePassword(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodPost) {
		return
	}

	userId := mux.Vars(r)["id"]
	password := r.FormValue("password")
	newPassWord := r.FormValue("newpassword")

	if !CheckPassWord(password, w, r) {
		log.Println("HandleUpdatePassword() => The password is not the same")
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("HandleUpdatePassword () => The password is not the same"))
		return
	}

	newPasswordEncrypted, err := EncryptUserPassword([]byte(newPassWord))
	if err != nil {
		log.Printf(" HandleUpdatePassword () => Error while encrypting password [err %v]", err)
	}

	var user = User{
		Password: newPasswordEncrypted,
	}

	user.UpdatePasswordIndb(userId)

	w.WriteHeader(http.StatusOK)
}

func HandleUpdateEmail(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodPost) {
		return
	}

	userId := mux.Vars(r)["id"]
	email := r.FormValue("email")
	log.Printf("userId [%s] est email [%s] ", userId, email)

	var user = User{
		EmailAddress: email,
	}

	user.UpdateEmailAddressIndb(userId)

	w.WriteHeader(http.StatusOK)
}

func CheckPassWord(password string, w http.ResponseWriter, r *http.Request) bool {
	user, _ := verifyJwt(w, r)
	hashPassword := []byte(user.Password)
	if err := bcrypt.CompareHashAndPassword(hashPassword, []byte(password)); err != nil {
		log.Println("Error while compare HashPassword", err)
		return false
	}
	return true
}

func CheckEmail(email string) bool {
	if matched, _ := regexp.MatchString(`[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+`, email); !matched {
		return false
	}

	return true
}

func (user *User) UpdatePasswordIndb(id string) (string, error) {
	bsonId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return "", err
	}
	_, err = database.Users.UpdateOne(
		ctx,
		primitive.M{"_id": bsonId},
		primitive.M{
			"$set": primitive.M{
				"password": user.Password,
			},
		},
	)
	if err != nil {
		log.Printf("Error while updating User password, error=%v", err)
		return "", err
	}

	return "", err
}

func (user *User) UpdateEmailAddressIndb(id string) (string, error) {
	bsonId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return "", err
	}
	_, err = database.Users.UpdateOne(
		ctx,
		primitive.M{"_id": bsonId},
		primitive.M{
			"$set": primitive.M{
				"emailAddress": user.EmailAddress,
			},
		},
	)
	if err != nil {
		log.Printf("Error while updating EmailAddress, error=%v", err)
		return "", err
	}

	return "", err
}
