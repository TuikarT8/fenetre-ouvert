package rest

import (
	"encoding/json"
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

func SessionsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		GetSessionHandler(w, r)
	} else if r.Method == http.MethodPost {
		PostSessionHandler(w, r)
	} else {
		reportWrongHttpMethod(w, r, r.Method)
	}
}

func GetSessionHandler(w http.ResponseWriter, r *http.Request) {
	if !checkMethod(w, r, http.MethodGet) {
		return
	}

	params, err := pageQueryFromRequestQueryParams(r)
	if err != nil {
		w.Write([]byte("GetSessionHandler ()=> Errors while gettig params"))
		log.Print("GetSessionHandler ()=> Errors while getting params", err)
		return
	}

	Sessions, err := getSessionsFromDB(params)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("GetSessionHandler ()=> Errors while gettig good"))
		log.Print("GetSessionHandler ()=> Errors while getting good", err)
		return
	}

	jsondata, err := json.Marshal(Sessions)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("GetSessionHandler ()=> Errors while marsalling good"))
		log.Print("GetSessionHandler ()=> Errors while marshalling good", err)
		return
	}
	w.Write(jsondata)
}

func PostSessionHandler(w http.ResponseWriter, r *http.Request) {
	if !checkMethod(w, r, http.MethodPost) {
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("postSessionHandler ()=> Errors lors de la lecture du corps de la requette"))
		log.Print("postSessionHandler ()=> Errors lors de la lecture du corps de la requette", err)
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
		w.Write([]byte("postSessionHandler ()=> Errors while creating good"))
		log.Print("postSessionHandler ()=> Errors while creating good", err)
		return
	}

	jsondata, _ := json.Marshal(Session)
	w.Write([]byte(jsondata))
}

func DeleteSessionHandler(w http.ResponseWriter, r *http.Request) {
	if !checkMethod(w, r, http.MethodDelete) {
		return
	}

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
	if !checkMethod(w, r, http.MethodPatch) {
		return
	}

	sessionId := mux.Vars(r)["id"]

	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(" UpdateSessionHandler ()=> Errors lors de la lecture du corps de la requette"))
		log.Print(" UpdateSessionHandler ()=> Errors lors de la lecture du corps de la requette", err)
		return
	}

	var session Session

	err = json.Unmarshal(body, &session)
	if err != nil {
		handleUnmarshallingError(err.Error(), w)
		return
	}

	if _, err := session.UpdateSessionInDb(sessionId); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("UpdateSessionHandler() => Errors while Updating session"))
		log.Print("UpdateSessionHandler() => Errors while Updating session", err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func ActiveSessionHandler(w http.ResponseWriter, r *http.Request) {
	if !checkMethod(w, r, http.MethodPatch) {
		return
	}

	sessionId := mux.Vars(r)["id"]
	if _, err := updateActiveSessionFromDB(sessionId); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("ActiveSessionHandler() => Errors while Active session"))
		log.Print("ActiveSessionHandler() => Errors while active session", err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func GetSessionGoodsHandler(w http.ResponseWriter, r *http.Request) {
	if !checkMethod(w, r, http.MethodGet) {
		return
	}

	sessionId := mux.Vars(r)["id"]
	var response SessionGoodsLookupResponse
	var err error

	if response, err = getGoodsMatchingSession(sessionId); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("GetSessionGoodsHandler() => Errors while retrieving session goods"))
		log.Printf("GetSessionGoodsHandler() => Error while retrieving session goods err=[%v]", err)
		return
	}

	w.WriteHeader(http.StatusOK)
	jsonData, _ := json.Marshal(response)
	w.Write(jsonData)
}

func (session *Session) saveSessionInDb() (string, error) {
	_, err := database.Sessions.InsertOne(database.Ctx, session)
	if err != nil {
		log.Printf("error inserting appointment, %v\n", err)
		return "", err
	}
	return "", nil
}

func getGoodsMatchingSession(sessionId string) (SessionGoodsLookupResponse, error) {
	if sessionId == "active" {
		return getGoodsMatchingActiveSession()
	}

	return getGoodsMatchingAnySession(sessionId)
}

func getGoodsMatchingAnySession(sessionId string) (SessionGoodsLookupResponse, error) {
	goods := make([]Good, 0)

	cusor, err := database.Goods.Find(database.Ctx, bson.M{"changes.sessionId": sessionId})
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return SessionGoodsLookupResponse{}, nil
		}
		return SessionGoodsLookupResponse{}, err
	}

	defer cusor.Close(database.Ctx)

	err = cusor.All(database.Ctx, &goods)
	if err != nil {
		return SessionGoodsLookupResponse{}, err
	}

	return SessionGoodsLookupResponse{
		SessionId: sessionId,
		Goods:     goods,
	}, nil
}

func getGoodsMatchingActiveSession() (SessionGoodsLookupResponse, error) {
	response := SessionGoodsLookupResponse{}
	sessions := make([]SessionGoodsLookupResponse, 0)

	cursor, err := database.Sessions.Aggregate(database.Ctx, []bson.M{
		{"$match": bson.M{"active": true}},
		{"$lookup": bson.M{
			"from":         "goods",
			"localField":   "_id",
			"foreignField": "changes.sessionId",
			"as":           "goods",
			"let":          bson.M{"changes": "$goods"},
			"pipeline": []bson.M{
				{
					"$match": bson.M{
						"changes.deleted": bson.M{"$ne": true},
					},
				},
			},
		}},
	})
	if err != nil {
		return response, err
	}

	if err = cursor.All(database.Ctx, &sessions); err != nil {
		return response, err
	}

	if len(sessions) > 0 {
		return sessions[0], nil
	}
	return response, nil
}

func getSessionsFromDB(pagination PageQueryParams) ([]Session, error) {
	sessions := make([]Session, 0)
	opts := options.Find().SetSort(bson.D{{"date", -1}})
	opts.Skip = &pagination.startAt
	opts.Limit = &pagination.count
	result, err := database.Sessions.Find(database.Ctx, bson.M{}, opts)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return sessions, nil
		}

		return sessions, err
	}

	defer result.Close(database.Ctx)

	err = result.All(database.Ctx, &sessions)
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
	_, err = database.Sessions.DeleteOne(database.Ctx, bson.M{
		"_id": bsonId,
	})

	if err != nil {
		return err
	}
	return nil
}

func updateActiveSessionFromDB(id string) (string, error) {
	bsonId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return "", err
	}

	updateMany := mongo.NewUpdateManyModel()
	updateMany.Filter = bson.M{"active": true}
	updateMany.Update = bson.M{"$set": bson.M{"active": false}}

	updateOne := mongo.NewUpdateOneModel()
	updateOne.Filter = bson.M{"_id": bsonId}
	updateOne.Update = bson.M{"$set": bson.M{"active": true}}
	_, err = database.Sessions.BulkWrite(
		database.Ctx,
		[]mongo.WriteModel{
			updateMany,
			updateOne,
		},
		options.BulkWrite().SetOrdered(true),
	)

	if err != nil {
		log.Printf("Error while updating Session, error=%v", err)
		return "", err
	}

	return "", err
}

func getActiveSessionFromDB() (Session, error) {
	return getOneSessionFromDBWithQuery(bson.M{
		"active": true,
	})
}

func getOneSessionFromDBWithQuery(query bson.M) (Session, error) {
	var sess Session

	result := database.Sessions.FindOne(ctx, query)

	err := result.Decode(&sess)
	if err != nil {
		return Session{}, err
	}
	return sess, nil
}

func getOneSessionFromDB(id string) (Session, error) {
	hexId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return Session{}, err
	}

	return getOneSessionFromDBWithQuery(bson.M{
		"_id": hexId,
	})
}
