package rest

import (
	"encoding/json"
	"fenetre-ouvert/database"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetUserHandler(w http.ResponseWriter, r *http.Request) {
	if !checkMethod(w, r, http.MethodGet) {
		return
	}

	params, err := pageQueryFromRequestQueryParams(r)
	if err != nil {
		w.Write([]byte(" GetUserHandler ()=> Errors while gettig params"))
		log.Print(" GetUserHandler ()=> Errors while getting params", err)
		return
	}

	Users, err := getUserInDb(params)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(" GetUserHandler ()=> Errors while gettig good"))
		log.Print(" GetUserHandler ()=> Errors while getting good", err)
		return
	}

	jsondata, err := json.Marshal(Users)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(" GetUserHandler ()=> Errors while marsalling good"))
		log.Print(" GetUserHandler ()=> Errors while marshalling good", err)
		return
	}
	w.Write(jsondata)
}

func PostUserHandler(w http.ResponseWriter, r *http.Request) {
	if !checkMethod(w, r, http.MethodPost) {
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(" postUserHandler ()=> Errors lors de la lecture du corps de la requette"))
		log.Print(" postUserHandler ()=> Errors lors de la lecture du corps de la requette", err)
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
		w.Write([]byte(" postUserHandler ()=> Errors while creating good"))
		log.Print(" postUserHandler ()=> Errors while creating good", err)
		return
	}

	jsondata, _ := json.Marshal(User)
	w.Write([]byte(jsondata))
}

func DeleteUserHandler(w http.ResponseWriter, r *http.Request) {
	if !checkMethod(w, r, http.MethodDelete) {
		return
	}

	UserId := mux.Vars(r)["id"]

	err := deleteUserInDb(UserId)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("deleteUserHandler() => Errors while deleting good"))
		log.Print("deleteUserHandler() => Errors while deleting good", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func UpdateUserHandler(w http.ResponseWriter, r *http.Request) {
	if !checkMethod(w, r, http.MethodPatch) {
		return
	}

	UserId := mux.Vars(r)["id"]

	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("  UpdateUserHandler ()=> Errors lors de la lecture du corps de la requette"))
		log.Print("  UpdateUserHandler ()=> Errors lors de la lecture du corps de la requette", err)
		return
	}

	var User User

	err = json.Unmarshal(body, &User)
	if err != nil {
		handleUnmarshallingError(err.Error(), w)
		return
	}

	if _, err := User.UpdateUserInDb(UserId); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(" UpdateGoodHandler() => Errors while Updating good"))
		log.Print(" UpdateGoodHandler() => Errors while Updating good", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
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
	opts.Skip = &pagination.startAt
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

func (user *User) UpdateUserInDb(id string) (string, error) {
	bsonId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return "", err
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
		return "", err
	}

	return "", err

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
