package Type

import "time"

type User struct {
	Id           int            `bson:"id" json:"id"`
	FirstName    string         `bson:"fistname" json:"firstname"`
	LastName     string         `bson:"lastname" json:"lastname"`
	MiddleName   string         `bson:"middlename" json:"middlename"`
	Notification []Notification `bson:"notification" json:"notification"`
}

type Good struct {
	Id                int    `bson:"id" json:"id"`
	Name              string `bson:"name" json:"name"`
	Description       string `bson:"description" json:"description"`
	Number            string `bson:"number" json:"number"`
	PurchaseValue     string `bson:"purchaseValue" json:"purchaseValue"`
	ConditionProperty string `bson:"conditionProperty" json:"conditionProperty"`
	SaleValue         string `bson:"saleValue" json:"saleValue"`
}

type Session struct {
	StartTime time.Time `bson:"starttime" json:"starttime"`
	EndTime   time.Time `bson:"endtime" json:"endtime"`
	Author    string    `bson:"author" json:"author"`
}

type Notification struct {
	Id          string `bson:"id" json:"id"`
	Title       string `bson:"title" json:"title"`
	Description string `bson:"description" json:"description"`
}
