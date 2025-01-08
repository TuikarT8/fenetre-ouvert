package rest

import "net/http"

func getAuthorFromRequest(r *http.Request) Author {
	user := r.Context().Value("user").(User)
	return Author{
		Name: user.GetUserFullName(),
		Id:   user.Id,
	}
}
