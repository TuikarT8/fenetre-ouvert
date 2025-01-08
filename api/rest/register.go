package rest

import (
	"log"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

func HandleSignupUser(w http.ResponseWriter, r *http.Request) {
	firstname := r.FormValue("firstname")
	middlename := r.FormValue("middlename")
	lastname := r.FormValue("lastname")
	email := r.FormValue("emailAddress")
	password := r.FormValue("password")
	address := r.FormValue("address")

	passwordEncrypted, err := EncryptUserPassword([]byte(password))
	if err != nil {
		log.Printf("Error while encrypting password [err %v]", err)
		// TODO send back an http error
	}

	var user = User{
		FirstName:    firstname,
		LastName:     lastname,
		EmailAddress: email,
		Password:     passwordEncrypted,
		MiddleName:   middlename,
		Address:      address,
	}

	err = user.Store()
	if err != nil {
		log.Printf("error while inserting user, %v", err)
		// TODO send back an http error
		return
	}

	w.WriteHeader(http.StatusOK)
}

func EncryptUserPassword(pwd []byte) (string, error) {
	hash, err := bcrypt.GenerateFromPassword(pwd, bcrypt.MinCost)
	if err != nil {
		log.Printf("Error while encrypting password, %v", err)
		return "", err
	}

	return string(hash), nil
}
