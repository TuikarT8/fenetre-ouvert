package database

import (
	"context"
	"fmt"
	"log"
	"os"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Users mongo.Collection
var Goods mongo.Collection
var GoodChanges mongo.Collection
var Notifications mongo.Collection
var Sessions mongo.Collection
var Ctx = context.TODO()

func getMongoUrlFromArgs() string {
	if len(os.Args) > 1 {
		return os.Args[1]
	}
	return ""
}

func getMongoUrl() string {
	urlsFromArgs := getMongoUrlFromArgs()

	if urlsFromArgs != "" {
		return urlsFromArgs
	}

	var DatabaseHost = "localhost"
	var DatabasePort = "27017"
	var DatabaseUser = "diligner"
	var DatabasePassword = "vermont2042Inmassacusset"
	var DatabaseName = "fenetre"
	var env = "DEV"

	if env != "PROD" {
		return fmt.Sprintf("mongodb://%s:%s", DatabaseHost, DatabasePort)
	}

	return fmt.Sprintf("mongodb+srv://%s:%s@%s/%s?retryWrites=true&w=majority", DatabaseUser, DatabasePassword, DatabaseHost, DatabaseName)
}

func ConnectTodataBase() {
	DatabaseName := "fenetre"
	MongoUrl := getMongoUrl()
	clientOptions := options.Client().ApplyURI(MongoUrl)
	client, err := mongo.Connect(Ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(Ctx, nil)
	if err != nil {
		log.Fatalf("Error while connecting to the database, error: %v", err)
	}

	log.Println("Successfully connect to the database")

	Users = *client.Database(DatabaseName).Collection("users")
	Goods = *client.Database(DatabaseName).Collection("goods")
	Notifications = *client.Database(DatabaseName).Collection("notifications")
	Sessions = *client.Database(DatabaseName).Collection("sessions")
	GoodChanges = *client.Database(DatabaseName).Collection("goodChanges")
}
