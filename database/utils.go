package database

import "go.mongodb.org/mongo-driver/bson/primitive"

func ConvertStringToPrimitiveOBjectId(id string) (primitive.ObjectID, error) {
	var hexId primitive.ObjectID
	var err error

	if hexId, err = primitive.ObjectIDFromHex(id); err != nil {
		return hexId, err
	}

	return hexId, nil
}
