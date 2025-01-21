package rest

import (
	"encoding/json"
	"fenetre-ouverte/api/rest/errors"
	"fenetre-ouverte/api/utils"
	"fenetre-ouverte/database"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

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
		utils.ReportWrongHttpMethod(w, r, r.Method)
	}
}

func GetSessionHandler(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodGet) {
		return
	}

	params, err := pageQueryFromRequestQueryParams(r)
	if err != nil {
		w.Write([]byte("GetSessionHandler () => Error while gettig params"))
		log.Print("GetSessionHandler () => Error while getting params", err)
		return
	}

	Sessions, err := getSessionsFromDB(params)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("GetSessionHandler () => Error while gettig good"))
		log.Print("GetSessionHandler () => Error while getting good", err)
		return
	}

	jsondata, err := json.Marshal(Sessions)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("GetSessionHandler () => Error while marsalling good"))
		log.Print("GetSessionHandler () => Error while marshalling good", err)
		return
	}
	w.Write(jsondata)
}

func GetOneSessionHandler(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodGet) {
		return
	}

	sessionId := mux.Vars(r)["id"]

	session, err := getOneSession(sessionId)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("GetOneSessionHandler () => Error while gettig session"))
		log.Print("GetOneSessionHandler () => Error while getting session", err)
		return
	}

	jsondata, err := json.Marshal(session)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("GetOneSessionHandler () => Error while marsalling session"))
		log.Print("GetOneSessionHandler () => Error while marshalling session", err)
		return
	}
	w.Write(jsondata)
}

func getOneSession(id string) (Session, error) {
	if id == "" {
		return Session{}, nil
	}

	hexId, err := database.ConvertStringToPrimitiveOBjectId(id)
	if err != nil {
		return Session{}, err
	}
	var session Session

	result := database.Sessions.FindOne(ctx, bson.M{
		"_id": hexId,
	})

	err = result.Decode(&session)
	if err != nil {
		return session, err
	}

	return session, nil
}

func PostSessionHandler(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodPost) {
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("postSessionHandler () => Errors lors de la lecture du corps de la requette"))
		log.Print("postSessionHandler () => Errors lors de la lecture du corps de la requette", err)
		return
	}

	var session Session
	err = json.Unmarshal(body, &session)
	if err != nil {
		handleUnmarshallingError(err.Error(), w)
		return
	}

	err = session.save()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("postSessionHandler () => Error while creating good"))
		log.Print("postSessionHandler () => Error while creating good", err)
		return
	}

	var event Event = Event{
		EntityId: session.Id,
		At:       time.Now(),
		Entity:   Entities_Session,
		Action:   EventOperation_Created,
		Author:   getAuthorFromRequest(r),
	}
	_ = event.save()

	jsondata, _ := json.Marshal(session)
	w.Write([]byte(jsondata))
}

func SessionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodDelete {
		DeleteSessionHandler(w, r)
	} else if r.Method == http.MethodGet {
		GetOneSessionHandler(w, r)
	} else {
		utils.ReportWrongHttpMethod(w, r, r.Method)
	}
}

func DeleteSessionHandler(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodDelete) {
		return
	}

	sessionId := mux.Vars(r)["id"]
	if count, _ := countSessionGood(sessionId); count > 0 {
		w.WriteHeader(http.StatusBadRequest)
		payload, _ := json.Marshal(errors.WebError{
			Code:        errors.ErrorSessionHasGoodChanges,
			Description: "Vous ne pouvez pas supprimer cette session car elle contient des changements.",
		})
		_, _ = w.Write(payload)
		return
	}

	err := deleteSession(sessionId)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("deleteSessionHandler() => Error while deleting good"))
		log.Print("deleteSessionHandler() => Error while deleting good", err)
		return
	}

	var event Event = Event{
		EntityId: sessionId,
		At:       time.Now(),
		Entity:   Entities_Session,
		Action:   EventOperation_Deleted,
		Author:   getAuthorFromRequest(r),
	}
	_ = event.save()

	w.WriteHeader(http.StatusNoContent)
}

func UpdateSessionHandler(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodPatch) {
		return
	}

	sessionId := mux.Vars(r)["id"]
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(" UpdateSessionHandler () => Errors lors de la lecture du corps de la requette"))
		log.Print(" UpdateSessionHandler () => Errors lors de la lecture du corps de la requette", err)
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
		w.Write([]byte("UpdateSessionHandler() => Error while Updating session"))
		log.Print("UpdateSessionHandler() => Error while Updating session", err)
		return
	}

	var event Event = Event{
		EntityId: session.Id,
		At:       time.Now(),
		Entity:   Entities_Session,
		Action:   EventOperation_Updated,
		Author:   getAuthorFromRequest(r),
	}
	_ = event.save()

	w.WriteHeader(http.StatusNoContent)
}

func HandleActivateSession(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodPatch) {
		return
	}

	sessionId := mux.Vars(r)["id"]
	if _, err := updateActiveSession(sessionId); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("HandleActivateSession() => Error while Active session"))
		log.Print("HandleActivateSession() => Error while active session", err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func HasActiveSessionHandler(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodGet) {
		return
	}
	var session Session
	var err error
	var exists = false

	if session, err = getActiveSessionFromDB(); err != nil && err != mongo.ErrNoDocuments {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("HAsActiveSessionHandler() => Error while get session "))
		log.Printf("HAsActiveSessionHandler() => Error while get session err=[%v]", err)
		return
	}

	if session.Id != nil {
		exists = true
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Add("Content-Type", "application/json")
	w.Write([]byte(fmt.Sprintf("{\"exists\": %t}", exists)))
}

func CloseSessionHandler(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodPost) {
		return
	}

	sessionId := mux.Vars(r)["id"]
	var err error

	if err = DisableCurrentActiveSession(sessionId); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("CloseSessionHandler() => Error while disactive session goods"))
		log.Printf("CloseSessionHandler() => Error while disactive session goods err=[%v]", err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func GetSessionGoodsHandler(w http.ResponseWriter, r *http.Request) {
	if !utils.AssertMethod(w, r, http.MethodGet) {
		return
	}

	sessionId := mux.Vars(r)["id"]
	var response SessionGoodsLookupResponse
	var err error

	if response, err = getGoodsMatchingSession(sessionId); err != nil {
		if err == mongo.ErrNoDocuments {
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte("404 Not found"))
			return
		}

		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("GetSessionGoodsHandler() => Error while retrieving session goods"))
		log.Printf("GetSessionGoodsHandler() => Error while retrieving session goods err=[%v]", err)
		return
	}

	w.WriteHeader(http.StatusOK)
	jsonData, _ := json.Marshal(response)
	w.Write(jsonData)
}

func (session *Session) save() error {
	result, err := database.Sessions.InsertOne(database.Ctx, session)
	if err != nil {
		log.Printf("error inserting session, %v\n", err)
		return err
	}

	session.Id = result.InsertedID
	return nil
}

func DisableCurrentActiveSession(sessionId string) error {
	if sessionId == "active" {
		session, _ := findActiveSession()

		_, err := database.Sessions.UpdateOne(
			database.Ctx,
			primitive.M{
				"_id": session.Id,
			},
			primitive.M{
				"$set": primitive.M{
					"active":    false,
					"closeDate": time.Now(),
				},
			},
		)
		if err != nil {
			return err
		}
	}
	return nil
}

func getGoodsMatchingSession(sessionId string) (SessionGoodsLookupResponse, error) {
	if sessionId == "active" {
		session, err := findActiveSession()
		if err != nil {
			return SessionGoodsLookupResponse{}, err
		}

		response, err := getGoodsMatchingActiveSession()
		if err != nil {
			return SessionGoodsLookupResponse{}, err
		}

		response.GoodsNotInSession, err = findGoodsNotInActiveSession(session)
		if err != nil {
			return SessionGoodsLookupResponse{}, err
		}

		return response, nil
	}

	return getGoodsMatchingAnySession(sessionId)
}

func getGoodsMatchingAnySession(stringSessionId string) (SessionGoodsLookupResponse, error) {
	goods := make([]Good, 0)
	sessionId, err := database.ConvertStringToPrimitiveOBjectId(stringSessionId)
	if err != nil {
		log.Printf("Error while retrieiving session goods, err=[%v]", err)
		return SessionGoodsLookupResponse{}, err
	}

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
						"deleted":         bson.M{"$ne": true},
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

func findGoodsNotInActiveSession(activeSession Session) ([]Good, error) {
	goods := make([]Good, 0)
	cursor, err := database.Goods.Aggregate(
		database.Ctx,
		[]bson.M{
			{
				"$match": bson.M{
					"deleted": bson.M{"$ne": true},
				},
			},
			{
				"$project": bson.M{
					"name":          1,
					"description":   1,
					"count":         1,
					"purchaseValue": 1,
					"deleted":       1,
					"condition":     1,
					"changes":       1,
					"changesForActiveSession": bson.M{
						"$filter": bson.M{
							"input": "$changes",
							"as":    "change",
							"cond": bson.M{
								"$eq": []interface{}{
									"$$change.sessionId",
									activeSession.Id,
								},
							},
						},
					},
				},
			},
			{
				"$project": bson.M{
					"name":          1,
					"description":   1,
					"count":         1,
					"purchaseValue": 1,
					"deleted":       1,
					"condition":     1,
					"changes":       1,
					"activeSessionChangesCount": bson.M{
						"$cond": bson.M{
							"if":   bson.M{"$isArray": "$changesForActiveSession"},
							"then": bson.M{"$size": "$changesForActiveSession"},
							"else": 0,
						},
					},
				},
			},
			{
				"$match": bson.M{
					"activeSessionChangesCount": bson.M{"$eq": 0},
				},
			},
		},
	)

	if err != nil {
		return goods, err
	}

	if err = cursor.All(database.Ctx, &goods); err != nil {
		return goods, err
	}

	return goods, nil
}

func getSessionsFromDB(pagination PageQueryParams) ([]Session, error) {
	sessions := make([]Session, 0)
	opts := options.Find().SetSort(bson.D{{"date", -1}})
	opts.Skip = &pagination.skip
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
			"$set": primitive.M{
				"author":    session.Author,
				"startDate": session.StartDate,
				"endDate":   session.EndDate,
			},
		},
	)

	if err != nil {
		log.Printf("Error while updating session, error=%v", err)
		return "", err
	}

	return "", nil
}

func deleteSession(id string) error {
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

func updateActiveSession(id string) (string, error) {
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

func countSessionGood(stringSessionId string) (int64, error) {
	sessonId, err := primitive.ObjectIDFromHex(stringSessionId)

	if err != nil {
		return 0, err
	}

	count, err := database.Goods.CountDocuments(ctx, bson.M{
		"changes.sessionId": sessonId,
	})
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (event *Event) save() error {
	_, err := database.Events.InsertOne(database.Ctx, event)
	if err != nil {
		log.Printf("error inserting event, %v\n", err)
		return err
	}

	return nil
}
