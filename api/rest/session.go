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

func GetSessionHandler(w http.ResponseWriter, r *http.Request) {
	checkMethod(w, r, http.MethodGet)

	params, err := pageQueryFromRequestQueryParams(r)
	if err != nil {
		w.Write([]byte(" GetSessionHandler ()=> Errors while gettig params"))
		log.Print(" GetSessionHandler ()=> Errors while getting params", err)
		return
	}

	Sessions, err := getSessionInDb(params)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(" GetSessionHandler ()=> Errors while gettig good"))
		log.Print(" GetSessionHandler ()=> Errors while getting good", err)
		return
	}

	jsondata, err := json.Marshal(Sessions)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(" GetSessionHandler ()=> Errors while marsalling good"))
		log.Print(" GetSessionHandler ()=> Errors while marshalling good", err)
		return
	}
	w.Write(jsondata)
}

func PostSessionHandler(w http.ResponseWriter, r *http.Request) {
	checkMethod(w, r, http.MethodPost)

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(" postSessionHandler ()=> Errors lors de la lecture du corps de la requette"))
		log.Print(" postSessionHandler ()=> Errors lors de la lecture du corps de la requette", err)
		return
	}

	var Session Session

	err = json.Unmarshal(body, &Session)
	if err != nil {
		handleUnmarshallingError(err.Error(), w)
		return
	}

	_, err = Session.saveSessionInDb()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(" postSessionHandler ()=> Errors while creating good"))
		log.Print(" postSessionHandler ()=> Errors while creating good", err)
		return
	}

	jsondata, _ := json.Marshal(Session)
	w.Write([]byte(jsondata))
}

func DeleteSessionHandler(w http.ResponseWriter, r *http.Request) {
	checkMethod(w, r, http.MethodDelete)

	SessionId := mux.Vars(r)["id"]

	err := deleteSessionInDb(SessionId)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("deleteSessionHandler() => Errors while deleting good"))
		log.Print("deleteSessionHandler() => Errors while deleting good", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func UpdateSessionHandler(w http.ResponseWriter, r *http.Request) {
	checkMethod(w, r, http.MethodPatch)

	sessionId := mux.Vars(r)["id"]

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("  UpdateSessionHandler ()=> Errors lors de la lecture du corps de la requette"))
		log.Print("  UpdateSessionHandler ()=> Errors lors de la lecture du corps de la requette", err)
		return
	}

	var session Session

	err = json.Unmarshal(body, &session)
	if err != nil {
		handleUnmarshallingError(err.Error(), w)
		return
	}
	log.Println("voici le idSession", sessionId)

	if _, err := session.UpdateSessionInDb(sessionId); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(" UpdateSessionHandler() => Errors while Updating session"))
		log.Print(" UpdateSessionHandler() => Errors while Updating session", err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (session *Session) saveSessionInDb() (string, error) {
	_, err := database.Sessions.InsertOne(ctx, session)
	if err != nil {
		log.Printf("error inserting appointment, %v\n", err)
		return "", err
	}
	return "", nil
}

func getSessionInDb(pagination PageQueryParams) ([]Session, error) {
	sessions := make([]Session, 0)
	opts := options.Find().SetSort(bson.D{{"date", -1}})
	opts.Skip = &pagination.startAt
	opts.Limit = &pagination.count
	result, err := database.Sessions.Find(ctx, bson.M{}, opts)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return sessions, nil
		}

		return sessions, err
	}

	defer result.Close(ctx)

	err = result.All(ctx, &sessions)
	if err != nil {
		return sessions, err
	}

	return sessions, nil
}

func (session *Session) UpdateSessionInDb(id string) (string, error) {
	bsonId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return "", err
	}

	_, err = database.Sessions.UpdateOne(
		ctx,
		primitive.M{"_id": bsonId},
		primitive.M{
			"$set": session,
		},
	)
	if err != nil {
		log.Printf("Error while updating Session, error=%v", err)
		return "", err
	}

	return "", err

}

func deleteSessionInDb(id string) error {
	bsonId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	_, err = database.Sessions.DeleteOne(ctx, bson.M{
		"_id": bsonId,
	})

	if err != nil {
		return err
	}
	return nil
}
