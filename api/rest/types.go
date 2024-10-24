package rest

import (
	"log"
	"net/http"
	"time"
)

type User struct {
	Id           interface{}    `bson:"_id,omitempty" json:"id"`
	FirstName    string         `bson:"fistname ,omitempty" json:"firstname"`
	LastName     string         `bson:"lastname ,omitempty" json:"lastname"`
	MiddleName   string         `bson:"middlename ,omitempty" json:"middlename"`
	Notification []Notification `bson:"notification ,omitempty" json:"notification"`
}

type Good struct {
	ID                interface{} `bson:"_id,omitempty" json:"id"`
	Name              string      `bson:"name,omitempty" json:"name"`
	Description       string      `bson:"description,omitempty" json:"description"`
	Count             string      `bson:"count,omitempty" json:"count"`
	PurchaseValue     string      `bson:"purchaseValue,omitempty" json:"purchaseValue"`
	ConditionProperty string      `bson:"conditionProperty,omitempty" json:"conditionProperty"`
	SaleValue         string      `bson:"saleValue,omitempty" json:"saleValue"`
	IdSession         interface{} `bson:"idSession,omitempty" json:"idSession"`
}

type Session struct {
	Id        interface{} `bson:"_id,omitempty" json:"id"`
	StartTime time.Time   `bson:"starttime ,omitempty" json:"starttime"`
	EndTime   time.Time   `bson:"endtime ,omitempty" json:"endtime"`
	Author    string      `bson:"author ,omitempty" json:"author"`
	Active    bool        `bson:"active" json:"active"`
}

type Notification struct {
	Id          interface{} `bson:"_id,omitempty" json:"id"`
	Title       string      `bson:"title ,omitempty" json:"title"`
	Description string      `bson:"description ,omitempty" json:"description"`
}

func checkMethod(w http.ResponseWriter, r *http.Request, method string) bool {
	if r.Method != method {
		log.Print("Vous tentez d'utiliser un Endpoint avec la methode Inaproprie", r.Method)
		w.WriteHeader(http.StatusMethodNotAllowed)
		w.Write([]byte("L'endpoint invalid"))
		return false
	}

	return true
}
