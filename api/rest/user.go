package rest

import (
	"encoding/json"
	"fenetre-ouverte/api/utils"
	"fenetre-ouverte/database"
	"io"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func HandleGetUsers(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodGet) {
		return
	}

	params, err := pageQueryFromRequestQueryParams(r)
	if err != nil {
		w.Write([]byte("HandleGetUsers () => Error while gettig params"))
		log.Print("HandleGetUsers () => Error while getting params", err)
		return
	}

	Users, err := getUserInDb(params)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("HandleGetUsers () => Error while gettig good"))
		log.Print("HandleGetUsers () => Error while getting good", err)
		return
	}

	jsondata, err := json.Marshal(Users)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("HandleGetUsers () => Error while marsalling good"))
		log.Print("HandleGetUsers () => Error while marshalling good", err)
		return
	}
	w.Write(jsondata)
}

func HandleCreateUser(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodPost) {
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("HandleCreateUser () => Errors lors de la lecture du corps de la requette"))
		log.Print("HandleCreateUser () => Errors lors de la lecture du corps de la requette", err)
		return
	}

	var User User

	err = json.Unmarshal(body, &User)
	if err != nil {
		handleUnmarshallingError(err.Error(), w)
		return
	}

	_, err = User.saveUserInDb()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("HandleCreateUser () => Error while creating good"))
		log.Print("HandleCreateUser () => Error while creating good", err)
		return
	}

	jsondata, _ := json.Marshal(User)
	w.Write([]byte(jsondata))
}

func HandleDeleteUser(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodDelete) {
		return
	}

	UserId := mux.Vars(r)["id"]

	err := deleteUserInDb(UserId)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("HandleDeleteUser() => Error while deleting good"))
		log.Print("HandleDeleteUser() => Error while deleting good", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func HandleUpdateUser(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodPatch) {
		return
	}

	UserId := mux.Vars(r)["id"]

	body, err := io.ReadAll(r.Body)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(" HandleUpdateUser () => Errors lors de la lecture du corps de la requette"))
		log.Print(" HandleUpdateUser () => Errors lors de la lecture du corps de la requette", err)
		return
	}

	var user User

	err = json.Unmarshal(body, &user)
	if err != nil {
		handleUnmarshallingError(err.Error(), w)
		return
	}

	if !CheckEmail(user.EmailAddress) {
		log.Println("HandleUpdateUser ()=> The password is not the same")
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("HandleUpdateUser ()=> The password is not the same"))
		return
	}

	if err := user.Update(UserId); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("HandleUpdateUser() => Error while Updating good"))
		log.Print("HandleUpdateUser() => Error while Updating good", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func UserHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		HandleGetUser(w, r)
	} else if r.Method == http.MethodPatch {
		HandleUpdateUser(w, r)
	} else {
		utils.ReportWrongHttpMethod(w, r, r.Method)
	}
}

func HandleGetUser(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodGet) {
		return
	}

	userId := mux.Vars(r)["id"]

	usr, err := getOneUser(userId)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("HandleGetUser ()=> Error while gettig user"))
		log.Print("HandleGetUser ()=> Error while getting user", err)
		return
	}

	jsondata, err := json.Marshal(usr)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("GetOneSessionHandler () => Error while marsalling good"))
		log.Print("GetOneSessionHandler () => Error while marshalling good", err)
		return
	}
	w.Write(jsondata)
}

func getOneUser(id string) (User, error) {
	hexId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return User{}, err
	}
	var user User

	result := database.Users.FindOne(ctx, bson.M{
		"_id": hexId,
	})

	err = result.Decode(&user)
	if err != nil {
		return User{}, err
	}

	return user, nil
}

func (User *User) saveUserInDb() (string, error) {
	_, err := database.Users.InsertOne(database.Ctx, User)
	if err != nil {
		log.Printf("error inserting appointment, %v\n", err)
		return "", err
	}
	return "", nil
}

func getUserInDb(pagination PageQueryParams) ([]User, error) {
	usrs := make([]User, 0)
	opts := options.Find().SetSort(bson.D{{"date", -1}})
	opts.Skip = &pagination.skip
	opts.Limit = &pagination.count
	result, err := database.Users.Find(database.Ctx, bson.M{}, opts)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return usrs, nil
		}

		return usrs, err
	}

	defer result.Close(database.Ctx)

	err = result.All(database.Ctx, &usrs)
	if err != nil {
		return usrs, err
	}

	return usrs, nil
}

func (user *User) Update(id string) error {
	bsonId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	_, err = database.Users.UpdateOne(
		ctx,
		primitive.M{"_id": bsonId},
		primitive.M{
			"$set": user,
		},
	)
	if err != nil {
		log.Printf("Error while updating User, error=%v", err)
		return err
	}

	return err
}

func deleteUserInDb(id string) error {
	bsonId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	_, err = database.Users.DeleteOne(database.Ctx, bson.M{
		"_id": bsonId,
	})

	if err != nil {
		return err
	}
	return nil
}
