package rest

import (
	"log"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

func RegisterUserHandler(w http.ResponseWriter, r *http.Request) {
	firstname := r.FormValue("firstname")
	middlename := r.FormValue("middlename")
	lastname := r.FormValue("lastname")
	email := r.FormValue("emailAddress")
	password := r.FormValue("password")
	address := r.FormValue("address")

	log.Printf(
		" firstName: %s, MiddleName: %s, lastName:%s, Email:%s, passWord:%s, address: %s", firstname, middlename, lastname, email, password, address)

	passwordEncrypted, err := EncryptUserPassword([]byte(password))
	if err != nil {
		log.Printf("Error while encrypting password [err %v]", err)
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
		return
	}

	w.WriteHeader(http.StatusOK)
}

func EncryptUserPassword(pwd []byte) (string, error) {
	hash, err := bcrypt.GenerateFromPassword(pwd, bcrypt.MinCost)
	if err != nil {
		log.Println(err)
	}

	return string(hash), err
}
